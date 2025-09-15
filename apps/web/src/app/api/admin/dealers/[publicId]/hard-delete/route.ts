import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { debugAuth, errorLog } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');

// DELETE /api/admin/dealers/[publicId]/hard-delete
// Borrado definitivo: elimina dealer y sus usuarios (si no hay préstamos asociados)
export async function DELETE(request: Request, context: any) {
  try {
    const { publicId } = (context?.params || {}) as { publicId: string };

    // Autorización ADMIN
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
      debugAuth('❕ DELETE /api/admin/dealers/[id]/hard-delete -> Bearer inválido o ausente');
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
        errorLog('❌ Error verificando JWT (cookies) en DELETE hard-delete:', err);
      }
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden eliminar definitivamente.' }, { status: 403 });
    }

    const dealer = await prisma.dealer.findFirst({
      where: { publicId, deletedAt: { not: null } },
      select: { id: true, publicId: true },
    });

    if (!dealer) {
      return NextResponse.json({ error: 'Concesionario no encontrado o no está en estado eliminado' }, { status: 404 });
    }

    // Por integridad: no permitir hard delete si existen préstamos asociados (aunque estén soft-deleted)
    const loanCount = await prisma.loanApplication.count({ where: { dealerId: dealer.id } });
    if (loanCount > 0) {
      return NextResponse.json({
        error: 'No se puede eliminar definitivamente: el concesionario tiene solicitudes asociadas.',
      }, { status: 409 });
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // Obtener usuarios del dealer
      const users = await tx.user.findMany({ where: { dealerId: dealer.id }, select: { id: true } });
      const userIds = users.map(u => u.id);

      if (userIds.length > 0) {
        // Revoca sesiones antes de borrar usuarios (por historial)
        await tx.refreshToken.updateMany({ where: { userId: { in: userIds }, revokedAt: null }, data: { revokedAt: now } });
        // Borra usuarios
        await tx.user.deleteMany({ where: { id: { in: userIds } } });
      }

      // Borra dealer definitivamente
      await tx.dealer.delete({ where: { id: dealer.id } });

      // Auditoría
      await tx.auditLog.create({
        data: {
          actorUserId: adminUserId ? parseInt(adminUserId, 10) : undefined,
          action: 'dealer.hard_deleted',
          entityType: 'dealer',
          entityId: dealer.publicId,
          metadata: { usersDeleted: userIds.length },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Concesionario eliminado definitivamente.' });
  } catch (error: any) {
    errorLog('💥 Error en DELETE /api/admin/dealers/[id]/hard-delete:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
