import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { debugAuth, errorLog } from '@/lib/logger';

// Esquema de validación para el login
const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'Contraseña requerida'),
});

// Función para generar JWT
function generateTokens(userId: number, role: string, dealerId?: number) {
  const payload = {
    userId,
    role,
    dealerId,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

// Función para crear hash del refresh token
async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 12);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Buscar usuario en la base de datos - TEMPORALMENTE SIN FILTRO deletedAt
    debugAuth('🔍 Buscando usuario con email:', email);
    
    // Primero buscar SIN filtro deletedAt para ver si existe
    const userWithDeleted = await prisma.user.findFirst({
      where: { email },
      include: {
        dealer: {
          select: {
            id: true,
            publicId: true,
            tradeName: true,
            status: true
          }
        }
      }
    });
    
    debugAuth('🔍 Usuario encontrado (con deleted):', userWithDeleted ? {
      id: userWithDeleted.id,
      email: userWithDeleted.email,
      deletedAt: userWithDeleted.deletedAt,
      status: userWithDeleted.status
    } : 'NO ENCONTRADO');

    // Buscar SOLO usuarios no eliminados
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        dealer: {
          select: {
            id: true,
            publicId: true,
            tradeName: true,
            status: true,
          },
        },
      },
    });

    // Verificar si el usuario existe
    if (!user) {
      debugAuth('🔍 Usuario no encontrado para email:', email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    debugAuth('🔍 Usuario encontrado:', { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      status: user.status,
      hasPassword: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length 
    });

    // Verificar si el usuario tiene contraseña configurada
    if (!user.passwordHash) {
      debugAuth('❌ Usuario sin contraseña configurada');
      return NextResponse.json(
        { error: 'Usuario no tiene contraseña configurada' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    debugAuth('🔍 Verificando contraseña para usuario:', user.email);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    debugAuth('🔍 Resultado validación contraseña:', isPasswordValid);
    
    if (!isPasswordValid) {
      debugAuth('❌ Contraseña inválida para usuario:', user.email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar estado del usuario
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Usuario suspendido' },
        { status: 403 }
      );
    }

    if (user.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Usuario pendiente de activación' },
        { status: 403 }
      );
    }

    // Permitir login para usuarios INVITED (deben cambiar contraseña)
    const mustChangePassword = user.status === 'INVITED';

    // Verificar estado del dealer si es un usuario DEALER
    if (user.role === 'DEALER') {
      if (!user.dealer) {
        return NextResponse.json(
          { error: 'Usuario no tiene concesionario asignado' },
          { status: 403 }
        );
      }

      if (user.dealer.status !== 'APPROVED') {
        let message = 'Concesionario no aprobado';
        switch (user.dealer.status) {
          case 'PENDING_APPROVAL':
            message = 'Concesionario pendiente de aprobación';
            break;
          case 'REJECTED':
            message = 'Concesionario rechazado';
            break;
          case 'SUSPENDED':
            message = 'Concesionario suspendido';
            break;
        }
        return NextResponse.json(
          { error: message },
          { status: 403 }
        );
      }
    }

    // Generar tokens - Para DEALER y EJECUTIVO_CUENTAS, usar dealerId del concesionario
    let dealerIdForToken: number | undefined = undefined;
    if (user.role === 'DEALER' || user.role === 'EJECUTIVO_CUENTAS') {
      dealerIdForToken = user.dealerId || undefined;
    }
    
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.role,
      dealerIdForToken
    );

    // Guardar refresh token en la base de datos
    const tokenHash = await hashToken(refreshToken);
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        userAgent,
        ip
      }
    });

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'auth.login',
        entityType: 'user',
        entityId: user.publicId,
        metadata: {
          userAgent,
          ip,
          role: user.role
        },
        ip
      }
    });

    // Preparar respuesta
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      mustChangePassword,
      token: accessToken, // Incluir token en la respuesta para localStorage
      user: {
        id: user.publicId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        dealer: user.dealer ? {
          id: user.dealer.publicId,
          name: user.dealer.tradeName,
          status: user.dealer.status
        } : null
      }
    });

    // Configurar cookies seguras
    const cookieOptions = {
      httpOnly: true,
      secure: false, // HTTP sin SSL en producción
      sameSite: 'lax' as const,
      path: '/'
    };

    response.cookies.set('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 // 15 minutos
    });

    response.cookies.set('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

    return response;
} catch (error) {
  errorLog('Login error:', error);
  
  return NextResponse.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  );
}
}