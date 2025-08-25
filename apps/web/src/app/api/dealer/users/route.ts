import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

// Esquema para crear ejecutivo de cuentas
const createUserSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  phone: z.string().optional(),
});

// Función para verificar autorización del dealer
async function verifyDealerAuth(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    return { error: 'No autorizado', status: 401 };
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        deletedAt: null 
      },
      include: {
        dealer: true
      }
    });

    if (!user || user.role !== 'DEALER') {
      return { error: 'No autorizado', status: 403 };
    }

    if (!user.dealer || user.dealer.status !== 'APPROVED') {
      return { error: 'Concesionario no aprobado', status: 403 };
    }

    return { user, dealer: user.dealer };
  } catch (error) {
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
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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

    const { email, firstName, lastName, phone } = validation.data;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
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

    // Generar contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Crear usuario ejecutivo
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        role: 'EJECUTIVO_CUENTAS',
        status: 'INVITED',
        passwordHash,
        dealerId: dealer.id,
        invitedAt: new Date(),
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

    // TODO: Enviar email con credenciales al ejecutivo
    console.log(`Credenciales para ejecutivo ${email}:`, {
      email,
      password: tempPassword,
      loginUrl: `${process.env.NEXTAUTH_URL}/login`
    });

    return NextResponse.json({
      success: true,
      message: 'Ejecutivo de cuentas creado exitosamente',
      user: {
        id: newUser.publicId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        status: newUser.status,
        tempPassword, // Solo para desarrollo - remover en producción
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}