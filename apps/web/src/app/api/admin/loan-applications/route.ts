import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import type { Prisma, LoanApplicationStatus } from '@prisma/client';

// Claves para verificar tokens según su tipo
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');

export async function GET(request: Request) {
  try {
    // 1) Verificar rol ADMIN desde headers, con fallback a JWT en cookie
    const headersList = await headers();
    let userRole = headersList.get('x-user-role');
    if (userRole !== 'ADMIN') {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (!accessToken && !refreshToken) {
          // No hay cookies, mantener userRole de headers
        } else if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          const pRole = (payload as any).role;
          if (pRole) userRole = String(pRole);
        } else if (refreshToken) {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          const pRole = (payload as any).role;
          if (pRole) userRole = String(pRole);
        }
      } catch (err) {
        console.error('❌ Error verificando JWT (access/refresh) desde cookie (GET admin loans):', err);
      }
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden acceder.' }, { status: 403 });
    }

    // 2) Validar parámetros de consulta con Zod
    const url = new URL(request.url);
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10),
      status: z
        .union([
          z.literal('ALL'),
          z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'A_RECONSIDERAR'])
        ])
        .optional(),
      dealerId: z.coerce.number().int().positive().optional(),
      search: z.string().trim().min(1).optional(),
    });

    const parsed = querySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      dealerId: url.searchParams.get('dealerId') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Parámetros inválidos', details: parsed.error.errors }, { status: 400 });
    }

    const { page, limit, status, dealerId, search } = parsed.data;

    // 3) Construir filtros dinámicos
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (dealerId) {
      where.dealerId = dealerId;
    }
    if (search) {
      // Nota: En MySQL la comparación suele ser case-insensitive por collation,
      // y Prisma no soporta `mode: 'insensitive'` en filtros string escalares para MySQL.
      // Por ello removemos `mode` para evitar errores 500.
      where.OR = [
        { applicantFirstName: { contains: search } },
        { applicantLastName: { contains: search } },
        { applicantCuil: { contains: search } },
        { applicantEmail: { contains: search } },
        { applicantPhone: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    // 4) Obtener solicitudes con información relacionada (solo campos necesarios)
    const [rows, totalCount] = await Promise.all([
      prisma.loanApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          publicId: true,
          applicantFirstName: true,
          applicantLastName: true,
          applicantCuil: true,
          applicantEmail: true,
          applicantPhone: true,
          vehiclePrice: true,
          loanAmount: true,
          monthlyPayment: true,
          loanTermMonths: true,
          cftAnnual: true,
          documentsMetadata: true,
          status: true,
          statusReason: true,
          reconsiderationReason: true as any,
          reconsiderationRequested: true as any,
          reconsiderationRequestedAt: true as any,
          createdAt: true,
          reviewedAt: true,
          dealer: {
            select: {
              id: true,
              tradeName: true, // se transformará a companyName
              email: true,     // se transformará a contactEmail
            },
          },
          submittedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.loanApplication.count({ where }),
    ]);

    // 5) Transformar Decimals a number y adaptar campos para la UI
    type AdminLoanRow = {
      id: number;
      publicId: string;
      applicantFirstName: string;
      applicantLastName: string;
      applicantCuil: string;
      applicantEmail: string;
      applicantPhone: string;
      vehiclePrice: Prisma.Decimal;
      loanAmount: Prisma.Decimal;
      monthlyPayment: Prisma.Decimal;
      loanTermMonths: number;
      cftAnnual: Prisma.Decimal;
      documentsMetadata: Prisma.JsonValue | null;
      status: LoanApplicationStatus;
      statusReason: string | null;
      reconsiderationReason: string | null;
      reconsiderationRequested: boolean;
      reconsiderationRequestedAt: Date | null;
      createdAt: Date;
      reviewedAt: Date | null;
      dealer: { id: number; tradeName: string; email: string | null };
      submittedByUser: { id: number; firstName: string; lastName: string; email: string };
    };

    const applications = rows.map((a: AdminLoanRow) => ({
      id: a.id,
      publicId: a.publicId,
      clientFirstName: a.applicantFirstName,
      clientLastName: a.applicantLastName,
      clientDni: a.applicantCuil,
      clientEmail: a.applicantEmail,
      clientPhone: a.applicantPhone,
      vehiclePrice: Number(a.vehiclePrice),
      loanAmount: Number(a.loanAmount),
      monthlyPayment: Number(a.monthlyPayment),
      loanTerm: a.loanTermMonths,
      cft: Number(a.cftAnnual),
      documentsMetadata: a.documentsMetadata,
      status: a.status,
      statusReason: a.statusReason ?? undefined,
      reconsiderationReason: a.reconsiderationReason ?? undefined,
      reconsiderationRequested: (a as any).reconsiderationRequested ?? false,
      reconsiderationRequestedAt: (a as any).reconsiderationRequestedAt ?? undefined,
      createdAt: a.createdAt,
      reviewedAt: a.reviewedAt ?? undefined,
      dealer: {
        id: a.dealer.id,
        companyName: a.dealer.tradeName,
        contactEmail: a.dealer.email,
      },
      submittedByUser: {
        id: a.submittedByUser.id,
        firstName: a.submittedByUser.firstName,
        lastName: a.submittedByUser.lastName,
        email: a.submittedByUser.email,
      },
    }));

    // 6) Paginación
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 7) Respuesta
    return NextResponse.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener solicitudes de préstamo:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// Endpoint para actualizar el estado de una solicitud
export async function PATCH(request: Request) {
  try {
    // 1) Verificar ADMIN y obtener userId (para reviewedByUserId)
    const headersList = await headers();
    let userRole = headersList.get('x-user-role');
    let userId = headersList.get('x-user-id');

    if (userRole !== 'ADMIN' || !userId) {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (!accessToken && !refreshToken) {
          // No hay cookies, mantener valores de headers
        } else if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          const pRole = (payload as any).role;
          const pUserId = (payload as any).userId;
          if (pRole) userRole = String(pRole);
          if (pUserId) userId = String(pUserId);
        } else if (refreshToken) {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          const pRole = (payload as any).role;
          const pUserId = (payload as any).userId;
          if (pRole) userRole = String(pRole);
          if (pUserId) userId = String(pUserId);
        }
      } catch (err) {
        console.error('❌ Error verificando JWT (access/refresh) desde cookie (PATCH admin loans):', err);
      }
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden modificar solicitudes.' }, { status: 403 });
    }

    // 2) Validar body con Zod
    const body = await request.json();
    const bodySchema = z.object({
      applicationId: z.string().min(1),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW']),
      adminNotes: z.string().optional(),
    });
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.errors }, { status: 400 });
    }

    const { applicationId, status, adminNotes } = parsed.data;

    // 3) Actualizar la solicitud (registrar quién revisó si lo tenemos). Si viene adminNotes, guardarlo en statusReason.
    const updatedApplication = await prisma.loanApplication.update({
      where: { publicId: applicationId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedByUserId: userId ? parseInt(userId, 10) : undefined,
        ...(adminNotes && adminNotes.trim() ? { statusReason: adminNotes.trim() } : {}),
      },
      include: {
        dealer: {
          select: {
            tradeName: true,
            email: true,
          },
        },
        submittedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // 4) Registrar en audit log
    try {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      await prisma.auditLog.create({
        data: {
          actorUserId: userId ? parseInt(userId, 10) : undefined,
          action: 'LOAN_APPLICATION_STATUS_UPDATE',
          entityType: 'LoanApplication',
          entityId: applicationId,
          metadata: {
            newStatus: status,
            adminNotes: adminNotes && adminNotes.trim() ? adminNotes.trim() : null,
          },
          ip,
        },
      });
    } catch (logErr) {
      console.warn('⚠️ No se pudo registrar audit log de actualización de estado:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud actualizada exitosamente.',
      data: updatedApplication,
    });
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}