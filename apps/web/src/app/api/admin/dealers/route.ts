import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { sendDealerInviteLink } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import { debugAuth, errorLog } from '@/lib/logger';
import crypto from 'node:crypto';

// Aseguramos runtime Node.js y comportamiento dinámico (sin cache) para usar Node APIs (crypto, Resend) en producción
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

// Claves para verificar tokens según su tipo
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');

// Esquema para obtener dealers pendientes
const getDealersSchema = z.object({
  // Se agrega 'DELETED' para listar concesionarios eliminados (soft delete)
  status: z.enum(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED', 'DELETED']).optional(),
});

// Esquema para aprobar/rechazar dealer
const updateDealerStatusSchema = z.object({
  dealerId: z.string(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

// GET - Obtener dealers para aprobación
export async function GET(request: NextRequest) {
  try {
    // Autorización: solo ADMIN
    // 1) Intentar primero desde request.headers (inyectados por middleware en GET/HEAD)
    let userRole = request.headers.get('x-user-role');

    // 2) Fallback a next/headers() en caso de que no venga desde request (entornos edge)
    if (!userRole) {
      const headersList = await headers();
      userRole = headersList.get('x-user-role');
    }

    debugAuth('🔐 GET /api/admin/dealers -> Step1 headers role:', userRole);

    if (userRole !== 'ADMIN') {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          const pRole = (payload as any).role;
          if (pRole) userRole = String(pRole);
        } else if (refreshToken) {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          const pRole = (payload as any).role;
          if (pRole) userRole = String(pRole);
        }
      } catch (err) {
        errorLog('❌ Error verificando JWT (GET admin/dealers):', err);
      }
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden acceder.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING_APPROVAL';

    const validation = getDealersSchema.safeParse({ status });
    if (!validation.success) {
      debugAuth('❗ GET /api/admin/dealers -> parámetros inválidos:', validation.error.flatten());
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    debugAuth('📥 GET /api/admin/dealers -> consultando dealers con status:', validation.data.status);
    let dealers: any[] = [];
    try {
      const whereClause: any = {};

      // Filtro por eliminados vs activos
      if (validation.data.status === 'DELETED') {
        whereClause.deletedAt = { not: null };
      } else if (validation.data.status === 'ALL') {
        // 'ALL' incluye eliminados y activos → no filtrar por deletedAt
      } else {
        whereClause.deletedAt = null;
      }

      // Solo agregar filtro de status si no es 'ALL' ni 'DELETED'
      if (validation.data.status && validation.data.status !== 'ALL' && validation.data.status !== 'DELETED') {
        whereClause.status = validation.data.status;
      }
      
      dealers = await prisma.dealer.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              publicId: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
              role: true,
              status: true,
              createdAt: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (e: any) {
      errorLog('💥 Prisma error en dealer.findMany:', {
        code: e?.code,
        meta: e?.meta,
        message: e?.message
      });
      return NextResponse.json(
        { error: 'Error consultando concesionarios' },
        { status: 500 }
      );
    }

    debugAuth('📤 GET /api/admin/dealers -> dealers encontrados:', dealers.length);
    return NextResponse.json({
      success: true,
      dealers: dealers.map(dealer => ({
        id: dealer.publicId,
        legalName: dealer.legalName || '',
        tradeName: dealer.tradeName || '',
        cuit: dealer.cuit || '',
        email: dealer.email || '',
        phone: dealer.phone || '',
        addressStreet: dealer.addressStreet || '',
        addressCity: dealer.addressCity || '',
        addressProvince: dealer.addressProvince || '',
        status: dealer.status,
        createdAt: dealer.createdAt,
        deletedAt: dealer.deletedAt,
        owner: dealer.users.find((user: any) => user.role === 'DEALER') || null,
        users: dealer.users || [],
      }))
    });

  } catch (error) {
    errorLog('💥 Error fetching dealers (GET /api/admin/dealers):', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Aprobar o rechazar dealer
export async function POST(request: NextRequest) {
  try {
    // Autorización: solo ADMIN
    const headersList = await headers();
    let userRole = headersList.get('x-user-role');
    let adminUserId = headersList.get('x-user-id');

    if (userRole !== 'ADMIN' || !adminUserId) {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          const pRole = (payload as any).role;
          const pUserId = (payload as any).userId;
          if (pRole) userRole = String(pRole);
          if (pUserId) adminUserId = String(pUserId);
        } else if (refreshToken) {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          const pRole = (payload as any).role;
          const pUserId = (payload as any).userId;
          if (pRole) userRole = String(pRole);
          if (pUserId) adminUserId = String(pUserId);
        }
      } catch (err) {
        console.error('❌ Error verificando JWT (POST admin/dealers):', err);
      }
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado: Solo administradores pueden modificar estado de dealers.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateDealerStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { dealerId, action, reason } = validation.data;

    // Buscar el dealer
    const dealer = await prisma.dealer.findFirst({
      where: {
        publicId: dealerId,
        deletedAt: null,
      },
      include: {
        users: {
          where: { role: 'DEALER' },
        },
      },
    });

    if (!dealer) {
      return NextResponse.json(
        { error: 'Concesionario no encontrado' },
        { status: 404 }
      );
    }

    if (dealer.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'El concesionario ya fue procesado' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // Para aprobar es obligatorio contar con email del concesionario
    if (action === 'approve' && (!dealer.email || dealer.email.trim() === '')) {
      return NextResponse.json(
        { error: 'El concesionario no tiene email configurado. Agrega un email antes de aprobar para poder enviar la invitación.' },
        { status: 400 }
      );
    }

    // Actualizar status del dealer
    const updatedDealer = await prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        status: newStatus,
        approvedAt: action === 'approve' ? new Date() : null,
        approvedByUserId:
          action === 'approve' && adminUserId ? parseInt(adminUserId, 10) : null,
      },
    });

    if (action === 'approve') {
      // Crear o actualizar usuario en estado INVITED (sin contraseña aún)
      let user;
      if (dealer.users.length > 0) {
        user = await prisma.user.update({
          where: { id: dealer.users[0].id },
          data: {
            passwordHash: null,
            status: 'INVITED',
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            publicId: uuidv4(),
            email: dealer.email || '',
            firstName: dealer.tradeName || 'Concesionario',
            lastName: 'Admin',
            role: 'DEALER',
            status: 'INVITED',
            passwordHash: null,
            dealerId: dealer.id,
          },
        });
      }

      // Generar token de establecimiento de contraseña (válido por 24h)
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      // Enviar email con link para establecer contraseña (si hay email)
      // Usamos NEXT_PUBLIC_BASE_URL (o APP_URL) si está configurado para evitar problemas de origen detrás de proxy
      const incomingOrigin = request.headers.get('origin') ?? new URL(request.url).origin;
      const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL;
      const baseUrl = configuredBaseUrl || incomingOrigin;
      if (dealer.email) {
        const setPasswordUrl = `${baseUrl}/set-password?token=${encodeURIComponent(rawToken)}`;
        if (process.env.NODE_ENV !== 'production') {
          console.log('[dev] Dealer invite setPasswordUrl:', setPasswordUrl, { incomingOrigin, configuredBaseUrl });
        }
        const emailResult = await sendDealerInviteLink({
          to: dealer.email,
          dealerName: dealer.tradeName || '',
          setPasswordUrl,
          supportEmail: process.env.CONTACT_RECIPIENT || undefined,
        });
        if (!emailResult.success) {
          console.error('Error sending invite link email:', emailResult.error);
        } else {
          console.log('[admin/dealers] Invite email queued via Resend');
        }
      }

      await prisma.auditLog.create({
        data: {
          actorUserId: adminUserId ? parseInt(adminUserId, 10) : undefined,
          action: 'dealer.approved',
          entityType: 'dealer',
          entityId: dealer.publicId,
          metadata: {
            userInvited: user.publicId,
            inviteSent: Boolean(dealer.email),
            inviteExpiresAt: expiresAt.toISOString(),
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Concesionario aprobado e invitación enviada por email',
        dealer: {
          id: updatedDealer.publicId,
          status: updatedDealer.status,
          approvedAt: updatedDealer.approvedAt,
        },
        user: {
          id: user.publicId,
          email: user.email,
          status: user.status,
        },
        ...(process.env.NODE_ENV !== 'production' ? { devSetPasswordUrl: `${origin}/set-password?token=${encodeURIComponent(rawToken)}` } : {}),
      });
    } else {
      await prisma.auditLog.create({
        data: {
          actorUserId: adminUserId ? parseInt(adminUserId, 10) : undefined,
          action: 'dealer.rejected',
          entityType: 'dealer',
          entityId: dealer.publicId,
          metadata: { reason: reason || 'Sin razón especificada' },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Concesionario rechazado',
        dealer: {
          id: updatedDealer.publicId,
          status: updatedDealer.status,
        },
      });
    }
  } catch (error) {
    console.error('Error updating dealer status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
