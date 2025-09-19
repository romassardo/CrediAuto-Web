import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');

export async function GET(
  request: Request,
  context: { params: Promise<{ publicId: string }> }
) {
  try {
    // 1) Identidad y autorización (Dealer/Ejecutivo/Admin)
    const headersList = await headers();
    let userRole = headersList.get('x-user-role');
    let userId = headersList.get('x-user-id');
    let dealerId = headersList.get('x-user-dealer-id');

    if (!userRole || !userId) {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        const refreshToken = cookieStore.get('refresh_token')?.value;
        const verify = async (token: string, key: Uint8Array) => {
          const { payload } = await jwtVerify(token, key);
          return payload as any;
        };
        if (accessToken) {
          const p = await verify(accessToken, JWT_SECRET);
          userRole = String(p.role);
          userId = String(p.userId);
          dealerId = p.dealerId != null ? String(p.dealerId) : dealerId;
        } else if (refreshToken) {
          const p = await verify(refreshToken, JWT_REFRESH_SECRET);
          userRole = String(p.role);
          userId = String(p.userId);
          dealerId = p.dealerId != null ? String(p.dealerId) : dealerId;
        }
      } catch (err) {
        console.error('❌ Error verificando JWT (GET loan detail portal):', err);
      }
    }

    if (!userRole || !userId) {
      return NextResponse.json({ error: 'No autorizado: faltan credenciales.' }, { status: 401 });
    }

    const { publicId } = await context.params;
    if (!publicId || publicId.length < 10) {
      return NextResponse.json({ error: 'Parámetro publicId inválido.' }, { status: 400 });
    }

    // 2) Restricción por rol: Dealer/Ejecutivo solo pueden ver solicitudes de su dealer
    const parsedDealerId = dealerId ? parseInt(dealerId, 10) : undefined;
    const where: any = { publicId };
    if (userRole !== 'ADMIN') {
      if (!parsedDealerId) {
        return NextResponse.json({ error: 'No autorizado: falta dealerId.' }, { status: 403 });
      }
      where.dealerId = parsedDealerId;
    }

    // 3) Buscar solicitud con campos completos (como admin)
    const a = await prisma.loanApplication.findFirst({
      where,
      select: {
        publicId: true,
        dealerId: true,
        executiveId: true,
        submittedByUserId: true,

        applicantFirstName: true,
        applicantLastName: true,
        applicantCuil: true,
        applicantEmail: true,
        applicantPhone: true,
        applicantBirthDate: true,
        applicantAddress: true,
        applicantCity: true,
        applicantProvince: true,
        applicantPostalCode: true,
        applicantMaritalStatus: true,

        spouseFirstName: true,
        spouseLastName: true,
        spouseCuil: true,
        spouseIncome: true,

        employmentType: true,
        employmentTypeOther: true,
        companyName: true,
        companyPhone: true,
        workExperience: true,

        vehicleCondition: true,
        vehicleBrand: true,
        vehicleModel: true,
        vehicleYear: true,
        vehicleVersion: true,

        vehiclePrice: true,
        loanAmount: true,
        downPayment: true,
        loanTermMonths: true,
        monthlyPayment: true,
        totalAmount: true,
        interestRate: true,
        cftAnnual: true,

        documentsMetadata: true,

        status: true,
        statusReason: true,
        reviewedAt: true,
        reviewedByUserId: true,

        reconsiderationRequested: true as any,
        reconsiderationReason: true as any,
        reconsiderationRequestedAt: true as any,
        reconsiderationReviewedAt: true as any,
        reconsiderationReviewedByUserId: true as any,
        reconsiderationDocumentsMetadata: true as any,

        submissionData: true,
        calculationData: true,

        createdAt: true,
        updatedAt: true,

        dealer: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
            cuit: true,
            email: true,
            phone: true,
            addressStreet: true,
            addressCity: true,
            addressProvince: true,
            postalCode: true,
            status: true,
          },
        },
        executive: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        submittedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!a) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });
    }

    // 4) Transformaciones (Decimals -> number, null -> undefined)
    const detail = {
      publicId: a.publicId,
      dealerId: a.dealerId,
      executiveId: a.executiveId ?? undefined,
      submittedByUserId: a.submittedByUserId,

      applicantFirstName: a.applicantFirstName,
      applicantLastName: a.applicantLastName,
      applicantCuil: a.applicantCuil,
      applicantEmail: a.applicantEmail,
      applicantPhone: a.applicantPhone,
      applicantBirthDate: a.applicantBirthDate ?? undefined,
      applicantAddress: a.applicantAddress ?? undefined,
      applicantCity: a.applicantCity ?? undefined,
      applicantProvince: a.applicantProvince ?? undefined,
      applicantPostalCode: a.applicantPostalCode ?? undefined,
      applicantMaritalStatus: a.applicantMaritalStatus ?? undefined,

      spouseFirstName: a.spouseFirstName ?? undefined,
      spouseLastName: a.spouseLastName ?? undefined,
      spouseCuil: a.spouseCuil ?? undefined,
      spouseIncome: a.spouseIncome != null ? Number(a.spouseIncome) : undefined,

      employmentType: a.employmentType ?? undefined,
      employmentTypeOther: a.employmentTypeOther ?? undefined,
      companyName: a.companyName ?? undefined,
      companyPhone: a.companyPhone ?? undefined,
      workExperience: a.workExperience ?? undefined,

      vehicleCondition: a.vehicleCondition ?? undefined,
      vehicleBrand: a.vehicleBrand ?? undefined,
      vehicleModel: a.vehicleModel ?? undefined,
      vehicleYear: a.vehicleYear ?? undefined,
      vehicleVersion: a.vehicleVersion ?? undefined,

      vehiclePrice: Number(a.vehiclePrice),
      loanAmount: Number(a.loanAmount),
      downPayment: Number(a.downPayment),
      loanTermMonths: a.loanTermMonths,
      monthlyPayment: Number(a.monthlyPayment),
      totalAmount: Number(a.totalAmount),
      interestRate: Number(a.interestRate),
      cftAnnual: Number(a.cftAnnual),

      documentsMetadata: a.documentsMetadata ?? undefined,

      status: a.status,
      statusReason: a.statusReason ?? undefined,
      reviewedAt: a.reviewedAt ?? undefined,
      reviewedByUserId: a.reviewedByUserId ?? undefined,

      submissionData: a.submissionData ?? undefined,
      calculationData: a.calculationData ?? undefined,

      reconsiderationRequested: (a as any).reconsiderationRequested ?? false,
      reconsiderationReason: (a as any).reconsiderationReason ?? undefined,
      reconsiderationRequestedAt: (a as any).reconsiderationRequestedAt ?? undefined,
      reconsiderationReviewedAt: (a as any).reconsiderationReviewedAt ?? undefined,
      reconsiderationReviewedByUserId: (a as any).reconsiderationReviewedByUserId ?? undefined,
      reconsiderationDocumentsMetadata: (a as any).reconsiderationDocumentsMetadata ?? undefined,

      createdAt: a.createdAt,
      updatedAt: a.updatedAt ?? undefined,

      dealer: (a as any).dealer ? {
        id: (a as any).dealer.id,
        legalName: (a as any).dealer.legalName ?? undefined,
        tradeName: (a as any).dealer.tradeName,
        cuit: (a as any).dealer.cuit ?? undefined,
        email: (a as any).dealer.email ?? undefined,
        phone: (a as any).dealer.phone ?? undefined,
        addressStreet: (a as any).dealer.addressStreet ?? undefined,
        addressCity: (a as any).dealer.addressCity ?? undefined,
        addressProvince: (a as any).dealer.addressProvince ?? undefined,
        postalCode: (a as any).dealer.postalCode ?? undefined,
        status: (a as any).dealer.status,
      } : undefined,

      executive: (a as any).executive ? {
        id: (a as any).executive.id,
        firstName: (a as any).executive.firstName ?? undefined,
        lastName: (a as any).executive.lastName ?? undefined,
        email: (a as any).executive.email,
        phone: (a as any).executive.phone ?? undefined,
      } : undefined,

      submittedByUser: (a as any).submittedByUser ? {
        id: (a as any).submittedByUser.id,
        firstName: (a as any).submittedByUser.firstName ?? undefined,
        lastName: (a as any).submittedByUser.lastName ?? undefined,
        email: (a as any).submittedByUser.email,
        role: (a as any).submittedByUser.role,
      } : undefined,
    } as const;

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    console.error('Error al obtener detalle de solicitud (portal):', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
