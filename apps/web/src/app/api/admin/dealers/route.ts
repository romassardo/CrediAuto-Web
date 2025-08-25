import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendDealerCredentials } from '@/lib/email';

const prisma = new PrismaClient();

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
        legalName: dealer.legalName,
        tradeName: dealer.tradeName,
        rut: dealer.rut,
        email: dealer.email,
        phone: dealer.phone,
        address: dealer.address,
        city: dealer.city,
        region: dealer.region,
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
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Aprobar o rechazar dealer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = updateDealerStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { dealerId, action, reason } = validation.data;

    // Buscar el dealer
    const dealer = await prisma.dealer.findUnique({
      where: { 
        publicId: dealerId,
        deletedAt: null 
      },
      include: {
        users: {
          where: { role: 'DEALER' }
        }
      }
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
        rejectedAt: action === 'reject' ? new Date() : null,
        rejectionReason: action === 'reject' ? reason : null,
      }
    });

    // Si se aprueba, crear usuario y enviar credenciales
    if (action === 'approve') {
      // Generar contraseña temporal
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      // Crear o actualizar usuario
      let user;
      if (dealer.users.length > 0) {
        // Actualizar usuario existente
        user = await prisma.user.update({
          where: { id: dealer.users[0].id },
          data: {
            passwordHash,
            status: 'INVITED', // Debe cambiar contraseña en primer login
            invitedAt: new Date(),
          }
        });
      } else {
        // Crear nuevo usuario
        user = await prisma.user.create({
          data: {
            email: dealer.email,
            firstName: dealer.contactFirstName || 'Usuario',
            lastName: dealer.contactLastName || 'Concesionario',
            role: 'DEALER',
            status: 'INVITED',
            passwordHash,
            dealerId: dealer.id,
            invitedAt: new Date(),
          }
        });
      }

      // Enviar email con credenciales
      const emailResult = await sendDealerCredentials({
        to: dealer.email,
        dealerName: dealer.tradeName,
        email: dealer.email,
        tempPassword,
        loginUrl: `${process.env.NEXTAUTH_URL}/login`
      });

      if (!emailResult.success) {
        console.error('Error sending credentials email:', emailResult.error);
        // Continuar con el proceso aunque falle el email
      }

      // Registrar en audit log
      await prisma.auditLog.create({
        data: {
          // actorUserId: adminUserId, // TODO: Obtener del JWT
          action: 'dealer.approved',
          entityType: 'dealer',
          entityId: dealer.publicId,
          metadata: {
            userCreated: user.publicId,
            tempPasswordSent: true,
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        }
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
        }
      });
    } else {
      // Registrar rechazo en audit log
      await prisma.auditLog.create({
        data: {
          action: 'dealer.rejected',
          entityType: 'dealer',
          entityId: dealer.publicId,
          metadata: {
            reason: reason || 'Sin razón especificada',
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Concesionario rechazado',
        dealer: {
          id: updatedDealer.publicId,
          status: updatedDealer.status,
          rejectedAt: updatedDealer.rejectedAt,
          rejectionReason: updatedDealer.rejectionReason,
        }
      });
    }

  } catch (error) {
    console.error('Error updating dealer status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}