import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import type { Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const s = String(value).replace(/"/g, '""');
  return `"${s}"`;
}

function toISO(d?: Date | null): string {
  return d ? new Date(d).toISOString() : '';
}

export async function GET(request: Request) {
  try {
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
        console.error('❌ Error verificando JWT (GET admin loans export):', err);
      }
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado: Solo administradores pueden exportar.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const querySchema = z.object({
      status: z
        .union([z.literal('ALL'), z.enum(['PENDING','UNDER_REVIEW','APPROVED','REJECTED','CANCELLED','A_RECONSIDERAR'])])
        .optional(),
      dealerId: z.coerce.number().int().positive().optional(),
      search: z.string().trim().min(1).optional(),
      format: z.enum(['csv','xlsx']).default('csv'),
      max: z.coerce.number().int().positive().max(10000).default(5000),
    });

    const parsed = querySchema.safeParse({
      status: url.searchParams.get('status') ?? undefined,
      dealerId: url.searchParams.get('dealerId') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      format: url.searchParams.get('format') ?? undefined,
      max: url.searchParams.get('max') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Parámetros inválidos', details: parsed.error.errors }, { status: 400 });
    }

    const { status, dealerId, search, format, max } = parsed.data;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (dealerId) where.dealerId = dealerId;
    if (search) {
      where.OR = [
        { applicantFirstName: { contains: search } },
        { applicantLastName: { contains: search } },
        { applicantCuil: { contains: search } },
        { applicantEmail: { contains: search } },
        { applicantPhone: { contains: search } },
      ];
    }

    const rows = await prisma.loanApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: max,
      select: {
        id: true,
        publicId: true,
        status: true,
        createdAt: true,
        reviewedAt: true,

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

        reconsiderationRequested: true as any,
        reconsiderationReason: true as any,
        reconsiderationRequestedAt: true as any,
        reconsiderationReviewedAt: true as any,
        reconsiderationReviewedByUserId: true as any,
        reconsiderationDocumentsMetadata: true as any,

        dealer: {
          select: {
            id: true,
            tradeName: true,
            email: true,
          }
        },
        submittedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        }
      }
    });

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Solicitudes');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Public ID', key: 'publicId', width: 36 },
        { header: 'Estado', key: 'status', width: 16 },
        { header: 'Creado', key: 'createdAt', width: 20 },
        { header: 'Revisado', key: 'reviewedAt', width: 20 },

        { header: 'Nombre', key: 'applicantFirstName', width: 18 },
        { header: 'Apellido', key: 'applicantLastName', width: 18 },
        { header: 'CUIL/DNI', key: 'applicantCuil', width: 18 },
        { header: 'Email', key: 'applicantEmail', width: 28 },
        { header: 'Teléfono', key: 'applicantPhone', width: 18 },
        { header: 'Nacimiento', key: 'applicantBirthDate', width: 14 },
        { header: 'Dirección', key: 'applicantAddress', width: 24 },
        { header: 'Ciudad', key: 'applicantCity', width: 18 },
        { header: 'Provincia', key: 'applicantProvince', width: 18 },
        { header: 'CP', key: 'applicantPostalCode', width: 10 },
        { header: 'Estado Civil', key: 'applicantMaritalStatus', width: 16 },

        { header: 'Cónyuge Nombre', key: 'spouseFirstName', width: 18 },
        { header: 'Cónyuge Apellido', key: 'spouseLastName', width: 18 },
        { header: 'Cónyuge CUIL', key: 'spouseCuil', width: 18 },
        { header: 'Ingreso Cónyuge', key: 'spouseIncome', width: 18 },

        { header: 'Tipo Empleo', key: 'employmentType', width: 16 },
        { header: 'Otro Empleo', key: 'employmentTypeOther', width: 18 },
        { header: 'Empresa', key: 'companyName', width: 22 },
        { header: 'Tel. Empresa', key: 'companyPhone', width: 16 },
        { header: 'Antigüedad', key: 'workExperience', width: 14 },

        { header: 'Condición Vehículo', key: 'vehicleCondition', width: 18 },
        { header: 'Marca', key: 'vehicleBrand', width: 14 },
        { header: 'Modelo', key: 'vehicleModel', width: 16 },
        { header: 'Año', key: 'vehicleYear', width: 8 },
        { header: 'Versión', key: 'vehicleVersion', width: 18 },

        { header: 'Precio Vehículo', key: 'vehiclePrice', width: 18 },
        { header: 'Monto Préstamo', key: 'loanAmount', width: 18 },
        { header: 'Anticipo', key: 'downPayment', width: 16 },
        { header: 'Plazo (m)', key: 'loanTermMonths', width: 12 },
        { header: 'Cuota', key: 'monthlyPayment', width: 16 },
        { header: 'Total a Pagar', key: 'totalAmount', width: 18 },
        { header: 'Tasa (%)', key: 'interestRate', width: 12 },
        { header: 'CFT Anual (%)', key: 'cftAnnual', width: 14 },

        { header: 'Dealer ID', key: 'dealerId', width: 12 },
        { header: 'Dealer', key: 'dealerTradeName', width: 24 },
        { header: 'Dealer Email', key: 'dealerEmail', width: 26 },

        { header: 'Usuario Envío ID', key: 'submittedByUserId', width: 16 },
        { header: 'Usuario Envío', key: 'submittedByUserName', width: 24 },
        { header: 'Usuario Email', key: 'submittedByUserEmail', width: 26 },
        { header: 'Usuario Rol', key: 'submittedByUserRole', width: 14 },

        { header: 'Docs (#)', key: 'documentsCount', width: 10 },
        { header: 'Docs JSON', key: 'documentsJson', width: 40 },

        { header: 'Recons. Solicitada', key: 'reconsiderationRequested', width: 16 },
        { header: 'Motivo Recons.', key: 'reconsiderationReason', width: 28 },
        { header: 'Recons. Fecha', key: 'reconsiderationRequestedAt', width: 20 },
        { header: 'Recons. Revisado', key: 'reconsiderationReviewedAt', width: 20 },
        { header: 'Recons. Revisado Por', key: 'reconsiderationReviewedByUserId', width: 18 },
        { header: 'Recons. Docs (#)', key: 'reconsiderationDocsCount', width: 14 },
        { header: 'Recons. Docs JSON', key: 'reconsiderationDocsJson', width: 40 },
      ];

      // Congelar encabezado
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];

      for (const a of rows as any[]) {
        const docs = Array.isArray(a.documentsMetadata)
          ? a.documentsMetadata
          : (() => { try { return JSON.parse(a.documentsMetadata || '[]'); } catch { return []; } })();
        const recDocs = Array.isArray(a.reconsiderationDocumentsMetadata)
          ? a.reconsiderationDocumentsMetadata
          : (() => { try { return JSON.parse(a.reconsiderationDocumentsMetadata || '[]'); } catch { return []; } })();

        worksheet.addRow({
          id: a.id,
          publicId: a.publicId,
          status: a.status,
          createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
          reviewedAt: a.reviewedAt ? new Date(a.reviewedAt) : undefined,

          applicantFirstName: a.applicantFirstName,
          applicantLastName: a.applicantLastName,
          applicantCuil: a.applicantCuil,
          applicantEmail: a.applicantEmail,
          applicantPhone: a.applicantPhone,
          applicantBirthDate: a.applicantBirthDate ? new Date(a.applicantBirthDate) : undefined,
          applicantAddress: a.applicantAddress,
          applicantCity: a.applicantCity,
          applicantProvince: a.applicantProvince,
          applicantPostalCode: a.applicantPostalCode,
          applicantMaritalStatus: a.applicantMaritalStatus,

          spouseFirstName: a.spouseFirstName,
          spouseLastName: a.spouseLastName,
          spouseCuil: a.spouseCuil,
          spouseIncome: a.spouseIncome != null ? Number(a.spouseIncome) : undefined,

          employmentType: a.employmentType,
          employmentTypeOther: a.employmentTypeOther,
          companyName: a.companyName,
          companyPhone: a.companyPhone,
          workExperience: a.workExperience,

          vehicleCondition: a.vehicleCondition,
          vehicleBrand: a.vehicleBrand,
          vehicleModel: a.vehicleModel,
          vehicleYear: a.vehicleYear,
          vehicleVersion: a.vehicleVersion,

          vehiclePrice: Number(a.vehiclePrice),
          loanAmount: Number(a.loanAmount),
          downPayment: Number(a.downPayment),
          loanTermMonths: a.loanTermMonths,
          monthlyPayment: Number(a.monthlyPayment),
          totalAmount: Number(a.totalAmount),
          interestRate: Number(a.interestRate),
          cftAnnual: Number(a.cftAnnual),

          dealerId: a.dealer?.id ?? undefined,
          dealerTradeName: a.dealer?.tradeName ?? undefined,
          dealerEmail: a.dealer?.email ?? undefined,

          submittedByUserId: a.submittedByUser?.id ?? undefined,
          submittedByUserName: `${a.submittedByUser?.firstName ?? ''} ${a.submittedByUser?.lastName ?? ''}`.trim(),
          submittedByUserEmail: a.submittedByUser?.email ?? undefined,
          submittedByUserRole: a.submittedByUser?.role ?? undefined,

          documentsCount: Array.isArray(docs) ? docs.length : 0,
          documentsJson: JSON.stringify(docs),

          reconsiderationRequested: a.reconsiderationRequested ? 'Sí' : 'No',
          reconsiderationReason: a.reconsiderationReason ?? '',
          reconsiderationRequestedAt: a.reconsiderationRequestedAt ? new Date(a.reconsiderationRequestedAt) : undefined,
          reconsiderationReviewedAt: a.reconsiderationReviewedAt ? new Date(a.reconsiderationReviewedAt) : undefined,
          reconsiderationReviewedByUserId: a.reconsiderationReviewedByUserId ?? undefined,
          reconsiderationDocsCount: Array.isArray(recDocs) ? recDocs.length : 0,
          reconsiderationDocsJson: JSON.stringify(recDocs),
        });
      }

      // Formatos: fechas, montos, tasas
      const dateCols = ['createdAt', 'reviewedAt', 'applicantBirthDate', 'reconsiderationRequestedAt', 'reconsiderationReviewedAt'];
      for (const key of dateCols) {
        const col = worksheet.getColumn(key);
        col.eachCell({ includeEmpty: false }, (cell: ExcelJS.Cell) => {
          cell.numFmt = 'yyyy-mm-dd hh:mm';
        });
      }

      const moneyCols = ['vehiclePrice','loanAmount','downPayment','monthlyPayment','totalAmount','spouseIncome'];
      for (const key of moneyCols) {
        const col = worksheet.getColumn(key);
        col.eachCell({ includeEmpty: false }, (cell: ExcelJS.Cell) => {
          cell.numFmt = '#,##0.00';
        });
      }

      const decimalCols = ['interestRate','cftAnnual'];
      for (const key of decimalCols) {
        const col = worksheet.getColumn(key);
        col.eachCell({ includeEmpty: false }, (cell: ExcelJS.Cell) => {
          cell.numFmt = '0.00'; // si quisieras porcentaje real, usa '0.00%' y guarda fracción (0.12)
        });
      }

      // Estilo encabezado
      const header = worksheet.getRow(1);
      header.font = { bold: true };
      header.alignment = { vertical: 'middle' };

      const buffer = await workbook.xlsx.writeBuffer();
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
      const filename = `loan-applications-${ts}.xlsx`;

      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const headersCsv = [
      'id','publicId','status','createdAt','reviewedAt',
      'applicantFirstName','applicantLastName','applicantCuil','applicantEmail','applicantPhone','applicantBirthDate','applicantAddress','applicantCity','applicantProvince','applicantPostalCode','applicantMaritalStatus',
      'spouseFirstName','spouseLastName','spouseCuil','spouseIncome',
      'employmentType','employmentTypeOther','companyName','companyPhone','workExperience',
      'vehicleCondition','vehicleBrand','vehicleModel','vehicleYear','vehicleVersion',
      'vehiclePrice','loanAmount','downPayment','loanTermMonths','monthlyPayment','totalAmount','interestRate','cftAnnual',
      'dealerId','dealerTradeName','dealerEmail',
      'submittedByUserId','submittedByUserName','submittedByUserEmail','submittedByUserRole',
      'documentsCount','documentsJson',
      'reconsiderationRequested','reconsiderationReason','reconsiderationRequestedAt','reconsiderationReviewedAt','reconsiderationReviewedByUserId','reconsiderationDocsCount','reconsiderationDocsJson'
    ];

    const lines: string[] = [];
    lines.push(headersCsv.map(csvEscape).join(','));

    for (const a of rows as any[]) {
      const docs = Array.isArray(a.documentsMetadata) ? a.documentsMetadata : (() => { try { return JSON.parse(a.documentsMetadata || '[]'); } catch { return []; } })();
      const recDocs = Array.isArray(a.reconsiderationDocumentsMetadata) ? a.reconsiderationDocumentsMetadata : (() => { try { return JSON.parse(a.reconsiderationDocumentsMetadata || '[]'); } catch { return []; } })();

      const row = [
        a.id,
        a.publicId,
        a.status,
        toISO(a.createdAt),
        toISO(a.reviewedAt),

        a.applicantFirstName,
        a.applicantLastName,
        a.applicantCuil,
        a.applicantEmail,
        a.applicantPhone,
        a.applicantBirthDate ? new Date(a.applicantBirthDate).toISOString().slice(0,10) : '',
        a.applicantAddress,
        a.applicantCity,
        a.applicantProvince,
        a.applicantPostalCode,
        a.applicantMaritalStatus,

        a.spouseFirstName,
        a.spouseLastName,
        a.spouseCuil,
        a.spouseIncome != null ? Number(a.spouseIncome) : '',

        a.employmentType,
        a.employmentTypeOther,
        a.companyName,
        a.companyPhone,
        a.workExperience,

        a.vehicleCondition,
        a.vehicleBrand,
        a.vehicleModel,
        a.vehicleYear,
        a.vehicleVersion,

        Number(a.vehiclePrice),
        Number(a.loanAmount),
        Number(a.downPayment),
        a.loanTermMonths,
        Number(a.monthlyPayment),
        Number(a.totalAmount),
        Number(a.interestRate),
        Number(a.cftAnnual),

        a.dealer?.id ?? '',
        a.dealer?.tradeName ?? '',
        a.dealer?.email ?? '',

        a.submittedByUser?.id ?? '',
        `${a.submittedByUser?.firstName ?? ''} ${a.submittedByUser?.lastName ?? ''}`.trim(),
        a.submittedByUser?.email ?? '',
        a.submittedByUser?.role ?? '',

        Array.isArray(docs) ? docs.length : 0,
        JSON.stringify(docs),

        a.reconsiderationRequested ? 'true' : 'false',
        a.reconsiderationReason ?? '',
        a.reconsiderationRequestedAt ? toISO(a.reconsiderationRequestedAt) : '',
        a.reconsiderationReviewedAt ? toISO(a.reconsiderationReviewedAt) : '',
        a.reconsiderationReviewedByUserId ?? '',
        Array.isArray(recDocs) ? recDocs.length : 0,
        JSON.stringify(recDocs)
      ];

      lines.push(row.map(csvEscape).join(','));
    }

    const csvBody = lines.join('\n');
    const bom = '\uFEFF'; // Para compatibilidad con Excel (UTF-8 BOM)
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const filename = `loan-applications-${ts}.csv`;

    return new Response(bom + csvBody, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error al exportar solicitudes de préstamo:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
