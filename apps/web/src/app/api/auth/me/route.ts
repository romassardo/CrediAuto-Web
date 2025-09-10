import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

export async function GET(request: NextRequest) {
  try {
    // 1) Preferir headers inyectados por el middleware (funciona incluso si access_token expiró y se usó refresh_token)
    const headerUserId = request.headers.get('x-user-id');
    let userId: number | null = headerUserId ? Number(headerUserId) : null;

    // 2) Fallback: verificar cookie access_token; si no está, intentar con refresh_token; último intento: Authorization Bearer
    if (!userId) {
      const accessToken = request.cookies.get('access_token')?.value;
      const refreshToken = request.cookies.get('refresh_token')?.value;

      if (accessToken) {
        try {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          userId = (payload.userId as number) ?? null;
        } catch (_e) {
          // access_token inválido, intentamos con refresh
        }
      }

      if (!userId && refreshToken) {
        try {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          userId = (payload.userId as number) ?? null;
        } catch (_e) {
          // refresh_token inválido, seguimos intentando
        }
      }

      if (!userId) {
        const auth = request.headers.get('authorization') || request.headers.get('Authorization');
        const bearer = auth && auth.startsWith('Bearer ')
          ? auth.slice('Bearer '.length)
          : null;
        if (bearer) {
          try {
            const { payload } = await jwtVerify(bearer, JWT_SECRET);
            userId = (payload.userId as number) ?? null;
          } catch (_e) {}
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: 'Token no encontrado' },
          { status: 401 }
        );
      }
    }

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