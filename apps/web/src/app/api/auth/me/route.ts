import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token no encontrado' },
        { status: 401 }
      );
    }

    // Verificar el token JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener datos del usuario desde la base de datos
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        deletedAt: null 
      },
      select: {
        id: true,
        publicId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        dealerId: true,
        dealer: {
          select: {
            id: true,
            publicId: true,
            tradeName: true,
            status: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 403 }
      );
    }

    // Si es un ejecutivo, verificar que el dealer esté activo
    if (user.role === 'EJECUTIVO_CUENTAS' && user.dealer?.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Concesionario no aprobado' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.publicId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        dealerId: user.dealerId,
        dealer: user.dealer ? {
          id: user.dealer.publicId,
          businessName: user.dealer.tradeName,
          status: user.dealer.status,
        } : null,
      },
    });

  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}