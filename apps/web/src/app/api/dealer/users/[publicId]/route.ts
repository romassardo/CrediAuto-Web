import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers, cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import { debugAuth, errorLog } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

// Reutiliza el patrón de autorización del dealer (igual que en /api/dealer/users)
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
        // ignorar
      }
    }

    debugAuth('🔐 verifyDealerAuth - Step3 cookies resolved', { userId, role, dealerIdHeader });

    if (!userId) {
      debugAuth('🔐 verifyDealerAuth - No userId after headers/bearer/cookies');
      return { error: 'No autorizado', status: 401 } as const;
    }

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
      return { error: 'No autorizado', status: 403 } as const;
    }

    if (!user.dealer || user.dealer.status !== 'APPROVED') {
      debugAuth('🔐 verifyDealerAuth - Forbidden: dealer not approved', { hasDealer: !!user.dealer, dealerStatus: user.dealer?.status });
      return { error: 'Concesionario no aprobado', status: 403 } as const;
    }

    return { user, dealer: user.dealer } as const;
  } catch (error) {
    errorLog('🔐 verifyDealerAuth - Error verifying token', error);
    return { error: 'Token inválido', status: 401 } as const;
  }
}

const patchSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  email: z.string().email('Email inválido').toLowerCase().optional(),
  phone: z.string().max(50, 'Teléfono muy largo').nullable().optional(),
}).refine((d) => typeof d.status !== 'undefined' || typeof d.email !== 'undefined' || typeof d.phone !== 'undefined', {
  message: 'No hay cambios para aplicar',
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const authResult = await verifyDealerAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user: dealerUser, dealer } = authResult;
    const { publicId } = await params;

    const body = await request.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    const target = await prisma.user.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!target) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (target.role !== 'EJECUTIVO_CUENTAS') {
      return NextResponse.json({ error: 'Solo puede gestionar ejecutivos de cuentas' }, { status: 403 });
    }

    if (target.dealerId !== dealer.id) {
      return NextResponse.json({ error: 'El usuario no pertenece a su concesionario' }, { status: 403 });
    }

    const { status: newStatus, email: newEmail, phone: newPhone } = parsed.data;

    await prisma.$transaction(async (tx) => {
      const dataToUpdate: { status?: 'ACTIVE'|'SUSPENDED'; email?: string; phone?: string | null } = {};
      if (typeof newStatus !== 'undefined') dataToUpdate.status = newStatus;
      if (typeof newEmail !== 'undefined') {
        // Chequear unicidad de email
        const existing = await tx.user.findFirst({ where: { email: newEmail, deletedAt: null, NOT: { id: target.id } } });
        if (existing) {
          throw Object.assign(new Error('El email ya está en uso'), { code: 'EMAIL_TAKEN' });
        }
        dataToUpdate.email = newEmail;
      }
      if (typeof newPhone !== 'undefined') dataToUpdate.phone = newPhone ?? null;

      if (Object.keys(dataToUpdate).length === 0) return; // nada que hacer

      await tx.user.update({ where: { id: target.id }, data: dataToUpdate });

      // Revocar tokens si se suspendió
      if (dataToUpdate.status === 'SUSPENDED') {
        await tx.refreshToken.updateMany({ where: { userId: target.id, revokedAt: null }, data: { revokedAt: new Date() } });
      }

      const changed = Object.keys(dataToUpdate);
      await tx.auditLog.create({
        data: {
          actorUserId: dealerUser.id,
          action: changed.includes('status') ? (dataToUpdate.status === 'ACTIVE' ? 'user.activated' : 'user.suspended') : 'user.updated',
          entityType: 'user',
          entityId: target.publicId,
          metadata: {
            dealerId: dealer.publicId,
            targetEmail: target.email,
            targetRole: target.role,
            changed,
            ...(dataToUpdate.status ? { newStatus: dataToUpdate.status } : {}),
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    errorLog('Error en PATCH /api/dealer/users/[publicId]:', error);
    if (error?.code === 'EMAIL_TAKEN') {
      return NextResponse.json({ error: 'El email ya está en uso' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const authResult = await verifyDealerAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user: dealerUser, dealer } = authResult;
    const { publicId } = await params;

    const target = await prisma.user.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!target) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (target.role !== 'EJECUTIVO_CUENTAS') {
      return NextResponse.json({ error: 'Solo puede eliminar ejecutivos de cuentas' }, { status: 403 });
    }

    if (target.dealerId !== dealer.id) {
      return NextResponse.json({ error: 'El usuario no pertenece a su concesionario' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      // Generar email anonimizado usando timestamp para garantizar unicidad
      const timestamp = Date.now();
      const anonymizedEmail = `ejecutivo_eliminado_${timestamp}@anonimo.local`;
      
      await tx.user.update({ 
        where: { id: target.id }, 
        data: { 
          deletedAt: new Date(), 
          status: 'SUSPENDED',
          email: anonymizedEmail // Anonizar email
        } 
      });
      await tx.refreshToken.updateMany({ where: { userId: target.id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditLog.create({
        data: {
          actorUserId: dealerUser.id,
          action: 'user.deleted',
          entityType: 'user',
          entityId: target.publicId,
          metadata: {
            dealerId: dealer.publicId,
            targetEmail: target.email, // Guardar email original en auditoría
            anonymizedEmail: anonymizedEmail, // También guardar el anonimizado
            targetRole: target.role,
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    errorLog('Error en DELETE /api/dealer/users/[publicId]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
