import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers, cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { debugAuth, errorLog } from '@/lib/logger';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

// Esquema para crear ejecutivo de cuentas (dealer define contraseña inicial)
const createUserSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  phone: z.string().optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmación requerida'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Función para verificar autorización del dealer
async function verifyDealerAuth(request: NextRequest) {
  try {
    // 1) Intentar con headers inyectados por el middleware (preferir request.headers)
    const reqHeaders = request.headers;
    const headersList = await headers();
    let userId = reqHeaders.get('x-user-id') || headersList.get('x-user-id');
    let role = reqHeaders.get('x-user-role') || headersList.get('x-user-role');
    let dealerIdHeader = reqHeaders.get('x-user-dealer-id') || headersList.get('x-user-dealer-id');
    debugAuth('🔐 verifyDealerAuth - Step1 headers', {
      path: request.nextUrl.pathname,
      method: request.method,
      xUserId: userId,
      xUserRole: role,
      xUserDealerId: dealerIdHeader,
    });

    // 2) Si faltan datos, intentar con Authorization: Bearer <token>
    if (!userId || !role) {
      const authHeader = headersList.get('authorization') || request.headers.get('authorization');
      const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
      if (bearer) {
        try {
          const { payload } = await jwtVerify(bearer, JWT_SECRET);
          userId = (payload as any).userId ? String((payload as any).userId) : userId;
          role = (payload as any).role ? String((payload as any).role) : role;
          dealerIdHeader = (payload as any).dealerId ? String((payload as any).dealerId) : dealerIdHeader;
        } catch {
          // ignorar, seguimos con fallback a cookies
        }
      }
      if (userId || role) {
        debugAuth('🔐 verifyDealerAuth - Step2 bearer resolved', { userId, role, dealerIdHeader });
      } else {
        debugAuth('🔐 verifyDealerAuth - Step2 bearer missing/invalid');
      }
    }

    // 3) Fallback a cookies si aún falta info
    if (!userId || !role) {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          userId = (payload as any).userId ? String((payload as any).userId) : userId;
          role = (payload as any).role ? String((payload as any).role) : role;
          dealerIdHeader = (payload as any).dealerId ? String((payload as any).dealerId) : dealerIdHeader;
        }
      } catch {
        // ignorar error de verificación; responderemos 401 abajo si falta identidad
      }
    }

    debugAuth('🔐 verifyDealerAuth - Step3 cookies resolved', { userId, role, dealerIdHeader });

    if (!userId) {
      debugAuth('🔐 verifyDealerAuth - No userId after headers/bearer/cookies');
      return { error: 'No autorizado', status: 401 };
    }

    // 4) Verificar usuario y rol en BD (aceptar id numérico o publicId)
    const parsedId = Number(userId);
    const whereClause = Number.isFinite(parsedId) && parsedId > 0
      ? { id: parsedId, deletedAt: null as Date | null }
      : { publicId: String(userId), deletedAt: null as Date | null };

    const user = await prisma.user.findFirst({
      where: whereClause as any,
      include: { dealer: true },
    });

    debugAuth('🔐 verifyDealerAuth - DB user', {
      userId,
      found: !!user,
      roleDb: user?.role,
      dealerStatus: user?.dealer?.status,
    });

    if (!user || user.role !== 'DEALER') {
      debugAuth('🔐 verifyDealerAuth - Forbidden: user missing or not DEALER', { userExists: !!user, roleDb: user?.role });
      return { error: 'No autorizado', status: 403 };
    }

    if (!user.dealer || user.dealer.status !== 'APPROVED') {
      debugAuth('🔐 verifyDealerAuth - Forbidden: dealer not approved', { hasDealer: !!user.dealer, dealerStatus: user.dealer?.status });
      return { error: 'Concesionario no aprobado', status: 403 };
    }

    return { user, dealer: user.dealer };
  } catch (error) {
    errorLog('🔐 verifyDealerAuth - Error verifying token', error);
    return { error: 'Token inválido', status: 401 };
  }
}

// GET - Obtener ejecutivos del concesionario
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyDealerAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { dealer } = authResult;

    const users = await prisma.user.findMany({
      where: {
        dealerId: dealer.id,
        role: 'EJECUTIVO_CUENTAS',
        deletedAt: null,
      },
      select: {
        publicId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    errorLog('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo ejecutivo de cuentas
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyDealerAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user: dealerUser, dealer } = authResult;
    const body = await request.json();

    // Validar datos
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, phone, password } = validation.data;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        deletedAt: null 
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    // Usar la contraseña definida por el dealer
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario ejecutivo
    const newUser = await prisma.user.create({
      data: {
        publicId: uuidv4(),
        email,
        firstName,
        lastName,
        phone,
        role: 'EJECUTIVO_CUENTAS',
        status: 'INVITED', // En el primer login deberá cambiar contraseña
        passwordHash,
        dealerId: dealer.id,
      }
    });

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: dealerUser.id,
        action: 'user.created',
        entityType: 'user',
        entityId: newUser.publicId,
        metadata: {
          role: 'EJECUTIVO_CUENTAS',
          dealerId: dealer.publicId,
          createdByDealer: true,
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ejecutivo de cuentas creado exitosamente. Deberá cambiar su contraseña en el primer ingreso.',
      user: {
        id: newUser.publicId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        status: newUser.status,
      }
    });

  } catch (error) {
    errorLog('Error creating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}