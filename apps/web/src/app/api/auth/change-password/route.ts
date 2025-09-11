import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmación de contraseña requerida'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Resolver identidad del usuario (headers -> cookies -> Authorization)
    const headerUserId = request.headers.get('x-user-id');
    let userId: number | null = headerUserId ? Number(headerUserId) : null;

    if (!userId) {
      const access = request.cookies.get('access_token')?.value;
      const refresh = request.cookies.get('refresh_token')?.value;

      if (access) {
        try {
          const { payload } = await jwtVerify(access, JWT_SECRET);
          userId = (payload.userId as number) ?? null;
        } catch (_) {}
      }

      if (!userId && refresh) {
        try {
          const { payload } = await jwtVerify(refresh, JWT_REFRESH_SECRET);
          userId = (payload.userId as number) ?? null;
        } catch (_) {}
      }

      if (!userId) {
        const auth = request.headers.get('authorization') || request.headers.get('Authorization');
        const bearer = auth && auth.startsWith('Bearer ')
          ? auth.slice('Bearer '.length)
          : null;
        if (bearer) {
          try {
            const { payload } = await jwtVerify(bearer, JWT_SECRET);
            userId = (payload.userId as number) ?? null;
          } catch (_) {}
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        deletedAt: null 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Usuario no tiene contraseña configurada' },
        { status: 400 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 400 }
      );
    }

    // Generar hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña y estado del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        status: user.status === 'INVITED' ? 'ACTIVE' : user.status // Activar si era invitado
      }
    });

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'auth.password_changed',
        entityType: 'user',
        entityId: user.publicId,
        metadata: {
          wasInvited: user.status === 'INVITED',
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    // Revocar tokens de refresh activos y limpiar cookies para forzar re-login
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente. Se cerró tu sesión por seguridad.',
    });

    const cookieBase = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    };

    response.cookies.set('access_token', '', cookieBase);
    response.cookies.set('refresh_token', '', cookieBase);

    return response;

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}