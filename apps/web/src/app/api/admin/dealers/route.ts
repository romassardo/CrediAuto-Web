import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { sendDealerCredentials } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

// Claves para verificar tokens según su tipo
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');

// Esquema para obtener dealers pendientes
const getDealersSchema = z.object({
  status: z.enum(['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
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
    const headersList = await headers();
    let userRole = headersList.get('x-user-role');

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
        console.error('❌ Error verificando JWT (GET admin/dealers):', err);
      }
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden acceder.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING_APPROVAL';

    const validation = getDealersSchema.safeParse({ status });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos' },
        { status: 400 }
      );
    }

    const dealers = await prisma.dealer.findMany({
      where: {
        status: validation.data.status as any,
        deletedAt: null,
      },
      include: {
        users: {
          where: { role: 'DEALER' },
          select: {
            publicId: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      dealers: dealers.map(dealer => ({
        id: dealer.publicId,
        legalName: dealer.legalName || '',
        tradeName: dealer.tradeName || '',
        // El frontend espera 'rut'; mapeamos desde 'cuit' en el schema
        rut: dealer.cuit || '',
        email: dealer.email || '',
        phone: dealer.phone || '',
        address: dealer.addressStreet || '',
        city: dealer.addressCity || '',
        region: dealer.addressProvince || '',
        status: dealer.status,
        createdAt: dealer.createdAt,
        owner: dealer.users[0] || null,
      }))
    });

  } catch (error) {
    console.error('Error fetching dealers:', error);
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
      // Generar contraseña temporal
      const tempPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      // Crear o actualizar usuario
      let user;
      if (dealer.users.length > 0) {
        user = await prisma.user.update({
          where: { id: dealer.users[0].id },
          data: {
            passwordHash,
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
            passwordHash,
            dealerId: dealer.id,
          },
        });
      }

      // Enviar email con credenciales (si hay email)
      const origin = request.headers.get('origin') ?? new URL(request.url).origin;
      if (dealer.email) {
        const emailResult = await sendDealerCredentials({
          to: dealer.email,
          dealerName: dealer.tradeName || '',
          email: dealer.email,
          tempPassword,
          loginUrl: `${origin}/login`,
        });
        if (!emailResult.success) {
          console.error('Error sending credentials email:', emailResult.error);
        }
      }

      await prisma.auditLog.create({
        data: {
          actorUserId: adminUserId ? parseInt(adminUserId, 10) : undefined,
          action: 'dealer.approved',
          entityType: 'dealer',
          entityId: dealer.publicId,
          metadata: {
            userCreated: user.publicId,
            tempPasswordSent: Boolean(dealer.email),
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Concesionario aprobado y credenciales enviadas',
        dealer: {
          id: updatedDealer.publicId,
          status: updatedDealer.status,
          approvedAt: updatedDealer.approvedAt,
        },
        user: {
          id: user.publicId,
          email: user.email,
          tempPassword, // Solo para desarrollo - remover en producción
        },
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
