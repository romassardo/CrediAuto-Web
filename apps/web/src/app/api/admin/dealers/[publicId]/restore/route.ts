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

// POST /api/admin/dealers/[publicId]/restore
// Restaura concesionario eliminado: deletedAt = null, estado SUSPENDED (no re-activa usuarios)
export async function POST(request: Request, context: any) {
  try {
    const { publicId } = (context?.params || {}) as { publicId: string };

    // Autorización ADMIN
    let userRole: string | null = null;
    let adminUserId: string | null = null;

    // 1) Authorization: Bearer
    try {
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userRole = String((payload as any).role || '');
        adminUserId = (payload as any).userId ? String((payload as any).userId) : null;
      }
    } catch (err) {
      debugAuth('❕ POST /api/admin/dealers/[id]/restore -> Bearer inválido o ausente');
    }

    // 2) Cookies fallback
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
        errorLog('❌ Error verificando JWT (cookies) en POST admin/dealers/[id]/restore:', err);
      }
    }

    // 3) Headers inyectados (GET/HEAD normalmente, pero intentamos como último recurso)
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
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden restaurar concesionarios.' }, { status: 403 });
    }

    const dealer = await prisma.dealer.findFirst({
      where: { publicId, deletedAt: { not: null } },
      select: { id: true, publicId: true, status: true },
    });

    if (!dealer) {
      return NextResponse.json({ error: 'Concesionario no encontrado o no está eliminado' }, { status: 404 });
    }

    // Restaurar: solo dealer. Los usuarios quedan suspendidos; un admin puede reactivarlos individualmente.
    const updated = await prisma.dealer.update({
      where: { id: dealer.id },
      data: { deletedAt: null, status: 'SUSPENDED' },
      select: { publicId: true, status: true },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: adminUserId ? parseInt(adminUserId, 10) : undefined,
        action: 'dealer.restored',
        entityType: 'dealer',
        entityId: dealer.publicId,
        metadata: { previousStatus: dealer.status, newStatus: updated.status },
        ip: getClientIp(request),
      },
    });

    return NextResponse.json({ success: true, message: 'Concesionario restaurado en estado SUSPENDED', dealer: updated });
  } catch (error: any) {
    errorLog('💥 Error en POST /api/admin/dealers/[id]/restore:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
