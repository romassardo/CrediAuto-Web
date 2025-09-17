import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers, cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { debugAuth, errorLog } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

// Normaliza la IP del cliente (primer IP de X-Forwarded-For, recortada a 45)
function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  const xri = request.headers.get('x-real-ip');
  const raw = (xff || xri || 'unknown').toString();
  const first = raw.split(',')[0]?.trim() || 'unknown';
  return first.length > 45 ? first.slice(0, 45) : first;
}

// Reutiliza el patrón de autorización del dealer (igual que en /api/dealer/users)
async function verifyDealerAuth(request: NextRequest) {
  try {
    const reqHeaders = request.headers;
    const headersList = await headers();
    let userId = reqHeaders.get('x-user-id') || headersList.get('x-user-id');
    let role = reqHeaders.get('x-user-role') || headersList.get('x-user-role');
    let dealerIdHeader = reqHeaders.get('x-user-dealer-id') || headersList.get('x-user-dealer-id');
    debugAuth('🔐 verifyDealerAuth (reset) - Step1 headers', { path: request.nextUrl.pathname, method: request.method, xUserId: userId, xUserRole: role, xUserDealerId: dealerIdHeader });

    if (!userId || !role) {
      const authHeader = headersList.get('authorization') || request.headers.get('authorization');
      const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
      if (bearer) {
        try {
          const { payload } = await jwtVerify(bearer, JWT_SECRET);
          userId = (payload as any).userId ? String((payload as any).userId) : userId;
          role = (payload as any).role ? String((payload as any).role) : role;
          dealerIdHeader = (payload as any).dealerId ? String((payload as any).dealerId) : dealerIdHeader;
        } catch {}
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
      } catch {}
    }

    if (!userId) {
      return { error: 'No autorizado', status: 401 } as const;
    }

    const parsedId = Number(userId);
    const whereClause = Number.isFinite(parsedId) && parsedId > 0
      ? { id: parsedId, deletedAt: null as Date | null }
      : { publicId: String(userId), deletedAt: null as Date | null };

    const user = await prisma.user.findFirst({ where: whereClause as any, include: { dealer: true } });

    if (!user || user.role !== 'DEALER') {
      return { error: 'No autorizado', status: 403 } as const;
    }
    if (!user.dealer || user.dealer.status !== 'APPROVED') {
      return { error: 'Concesionario no aprobado', status: 403 } as const;
    }

    return { user, dealer: user.dealer } as const;
  } catch (error) {
    errorLog('verifyDealerAuth (reset) error', error);
    return { error: 'Token inválido', status: 401 } as const;
  }
}

export async function POST(
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

    const target = await prisma.user.findFirst({ where: { publicId, deletedAt: null } });
    if (!target) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (target.role !== 'EJECUTIVO_CUENTAS') {
      return NextResponse.json({ error: 'Solo puede gestionar ejecutivos de cuentas' }, { status: 403 });
    }
    if (target.dealerId !== dealer.id) {
      return NextResponse.json({ error: 'El usuario no pertenece a su concesionario' }, { status: 403 });
    }

    // Generar contraseña temporal y hashearla
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: target.id }, data: { passwordHash } });
      // Revocar sesiones activas
      await tx.refreshToken.updateMany({ where: { userId: target.id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditLog.create({
        data: {
          actorUserId: dealerUser.id,
          action: 'user.password_reset',
          entityType: 'user',
          entityId: target.publicId,
          metadata: { dealerId: dealer.publicId, targetEmail: target.email, targetRole: target.role },
          ip: getClientIp(request),
        },
      });
    });

    // Nota: En producción, enviaríamos email con instrucciones y NO devolveríamos la contraseña temporal.
    return NextResponse.json({ success: true, message: 'Contraseña temporal generada', tempPassword });
  } catch (error) {
    errorLog('Error en POST /api/dealer/users/[publicId]/reset-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
