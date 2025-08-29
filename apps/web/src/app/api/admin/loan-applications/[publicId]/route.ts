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
    // 1) Verificar rol ADMIN desde headers, con fallback a JWT en cookie
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
        console.error('❌ Error verificando JWT (GET admin loan detail):', err);
      }
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden acceder.' }, { status: 403 });
    }

    // 2) Leer parámetro dinámico
    const { publicId } = await context.params;

    if (!publicId || publicId.length < 10) {
      return NextResponse.json({ error: 'Parámetro publicId inválido.' }, { status: 400 });
    }

    // 3) Buscar solicitud con todos los campos necesarios para el modal
    const a = await prisma.loanApplication.findUnique({
      where: { publicId },
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

        submissionData: true,
        calculationData: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    if (!a) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });
    }

    // 4) Transformar Decimals a number y opcionales a undefined
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

      createdAt: a.createdAt,
      updatedAt: a.updatedAt ?? undefined,
    } as const;

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    console.error('Error al obtener detalle de solicitud:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
