import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { errorLog } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');

export async function GET(request: NextRequest) {
  try {
    // 1) Intentar obtener identidad desde headers inyectados por middleware
    const headerUserId = request.headers.get('x-user-id');
    const headerRole = request.headers.get('x-user-role');
    const headerDealerId = request.headers.get('x-user-dealer-id');

    let userId: number | null = headerUserId ? parseInt(headerUserId, 10) : null;
    let role: string | null = headerRole || null;
    let dealerId: number | null = headerDealerId ? parseInt(headerDealerId, 10) : null;

    // 2) Fallback: verificar cookies (access_token primero, luego refresh_token)
    if (!userId) {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('access_token')?.value;
      const refreshToken = cookieStore.get('refresh_token')?.value;

      if (!accessToken && !refreshToken) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      try {
        if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          userId = (payload.userId as number) ?? null;
          role = (payload.role as string) ?? null;
          dealerId = (payload.dealerId as number) ?? null;
        } else if (refreshToken) {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          userId = (payload.userId as number) ?? null;
          role = (payload.role as string) ?? null;
          dealerId = (payload.dealerId as number) ?? null;
        }
      } catch (err) {
        errorLog('❌ Error verificando JWT en /my-applications:', err);
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Obtener datos del usuario
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        deletedAt: null 
      },
      select: {
        id: true,
        role: true,
        dealerId: true,
        dealer: {
          select: {
            id: true,
            tradeName: true,
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

    let whereCondition: any = {};

    // Filtrar según el rol del usuario
    if (user.role === 'EJECUTIVO_CUENTAS') {
      // Ejecutivos solo ven sus propias solicitudes
      whereCondition.submittedByUserId = user.id;
    } else if (user.role === 'DEALER') {
      // Dealers ven todas las solicitudes de su concesionario
      if (user.dealerId) {
        // Más simple y alineado con la otra ruta: filtrar por dealerId
        whereCondition.dealerId = user.dealerId
      } else {
        // Si el dealer no tiene dealerId, solo sus propias solicitudes
        whereCondition.submittedByUserId = user.id
      }
    } else if (user.role === 'ADMIN') {
      // Admins ven todas las solicitudes (sin filtro adicional)
    } else {
      return NextResponse.json(
        { error: 'Rol no autorizado' },
        { status: 403 }
      );
    }


    // Obtener solicitudes filtradas
    const applications = await prisma.loanApplication.findMany({
      where: whereCondition,
      select: {
        publicId: true,
        // Datos del solicitante (según schema.prisma)
        applicantFirstName: true,
        applicantLastName: true,
        applicantCuil: true,
        applicantEmail: true,
        applicantPhone: true,
        // Cálculos del préstamo
        vehiclePrice: true,
        loanAmount: true,
        monthlyPayment: true,
        loanTermMonths: true,
        interestRate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        dealerId: true,
        submittedByUserId: true,
        submittedByUser: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      applications,
      userInfo: {
        role: user.role,
        dealerName: user.dealer?.tradeName || null,
        totalApplications: applications.length
      }
    });

  } catch (error) {
    errorLog('Error en /api/loan-applications/my-applications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
