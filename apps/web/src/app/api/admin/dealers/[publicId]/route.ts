import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { debugAuth, errorLog } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');
// Normaliza la IP del cliente (primer IP de X-Forwarded-For, recortada a 45)
function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  const xri = request.headers.get('x-real-ip');
  const raw = (xff || xri || 'unknown').toString();
  const first = raw.split(',')[0]?.trim() || 'unknown';
  return first.length > 45 ? first.slice(0, 45) : first;
}

// DELETE /api/admin/dealers/[publicId]
// Soft delete de concesionarios: marca deletedAt, pone SUSPENDED, suspende usuarios y revoca refresh tokens
export async function DELETE(request: Request, context: any) {
  try {
    const { publicId } = (context?.params || {}) as { publicId: string };

    // Autorización ADMIN: leer primero Authorization Bearer, luego cookies
    let userRole: string | null = null;
    let adminUserId: string | null = null;

    try {
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userRole = String((payload as any).role || '');
        adminUserId = (payload as any).userId ? String((payload as any).userId) : null;
      }
    } catch (err) {
      debugAuth('❕ DELETE /api/admin/dealers/[id] -> Bearer inválido o ausente');
    }

    if (!userRole || userRole !== 'ADMIN') {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          userRole = String((payload as any).role || '');
          adminUserId = (payload as any).userId ? String((payload as any).userId) : null;
        } else if (refreshToken) {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          userRole = String((payload as any).role || '');
          adminUserId = (payload as any).userId ? String((payload as any).userId) : null;
        }
      } catch (err) {
        errorLog('❌ Error verificando JWT (cookies) en DELETE admin/dealers/[id]:', err);
      }
    }

    // En algunos despliegues, el middleware podría inyectar headers en GET/HEAD únicamente
    if (!userRole || userRole !== 'ADMIN') {
      try {
        const hdrs = await headers();
        const hdrRole = hdrs.get('x-user-role');
        const hdrUserId = hdrs.get('x-user-id');
        if (hdrRole) userRole = hdrRole;
        if (hdrUserId) adminUserId = hdrUserId;
      } catch {}
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden eliminar concesionarios.' }, { status: 403 });
    }

    // Buscar dealer activo (no eliminado)
    const dealer = await prisma.dealer.findFirst({
      where: { publicId, deletedAt: null },
      select: { id: true, publicId: true, status: true },
    });

    if (!dealer) {
      return NextResponse.json({ error: 'Concesionario no encontrado' }, { status: 404 });
    }

    const now = new Date();

    // Obtener usuarios vinculados
    const users = await prisma.user.findMany({
      where: { dealerId: dealer.id, deletedAt: null },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    // Ejecutar en transacción: marcar dealer y usuarios como eliminados/suspendidos y revocar refresh tokens
    await prisma.$transaction(async (tx) => {
      await tx.dealer.update({
        where: { id: dealer.id },
        data: { deletedAt: now, status: 'SUSPENDED' },
      });

      if (userIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: 'SUSPENDED', deletedAt: now },
        });

        await tx.refreshToken.updateMany({
          where: { userId: { in: userIds }, revokedAt: null },
          data: { revokedAt: now },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId: adminUserId ? parseInt(adminUserId, 10) : undefined,
          action: 'dealer.soft_deleted',
          entityType: 'dealer',
          entityId: dealer.publicId,
          metadata: { usersAffected: userIds.length },
          ip: getClientIp(request),
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Concesionario eliminado y acceso bloqueado' });
  } catch (error: any) {
    errorLog('💥 Error en DELETE /api/admin/dealers/[id]:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
