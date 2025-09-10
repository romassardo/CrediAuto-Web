import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withTransaction } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth-helpers';

const TermsSchema = z.object({
  6: z.number().min(0.0001).max(1),
  12: z.number().min(0.0001).max(1),
  24: z.number().min(0.0001).max(1),
  48: z.number().min(0.0001).max(1),
});

const CreateAutoRateRangeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  yearFrom: z.number().int().min(1900).max(2050),
  yearTo: z.number().int().min(1900).max(2050),
  isActive: z.boolean().default(true),
  terms: TermsSchema,
}).refine((d) => d.yearFrom <= d.yearTo, {
  message: 'El año desde debe ser menor o igual al año hasta',
  path: ['yearFrom'],
});

// GET /api/admin/rates/auto
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    // Traer todas las filas de auto_interest_rate_ranges con info del creador
    const rows = await prisma.$queryRaw<Array<{
      id: number;
      name: string;
      description: string | null;
      yearFrom: number;
      yearTo: number;
      termMonths: number;
      interestRate: any;
      isActive: number | boolean;
      createdAt: Date;
      updatedAt: Date;
      createdByUserId: number | null;
      createdByUser_id: number | null;
      createdByUser_firstName: string | null;
      createdByUser_lastName: string | null;
      createdByUser_email: string | null;
    }>>`
      SELECT
        arr.id,
        arr.name,
        arr.description,
        arr.yearFrom,
        arr.yearTo,
        arr.termMonths,
        arr.interestRate,
        arr.isActive,
        arr.createdAt,
        arr.updatedAt,
        arr.createdByUserId,
        u.id AS createdByUser_id,
        u.firstName AS createdByUser_firstName,
        u.lastName AS createdByUser_lastName,
        u.email AS createdByUser_email
      FROM auto_interest_rate_ranges AS arr
      LEFT JOIN users AS u ON u.id = arr.createdByUserId
      ORDER BY arr.yearFrom ASC, arr.yearTo ASC, arr.termMonths ASC
    `;

    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      yearFrom: Number(r.yearFrom),
      yearTo: Number(r.yearTo),
      termMonths: Number(r.termMonths),
      interestRate: typeof r.interestRate === 'string' ? parseFloat(r.interestRate) : Number(r.interestRate),
      isActive: typeof r.isActive === 'boolean' ? r.isActive : r.isActive === 1,
      createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
      updatedAt: (r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt)).toISOString(),
      ...(r.createdByUser_id ? {
        createdByUser: {
          id: r.createdByUser_id,
          firstName: r.createdByUser_firstName ?? '',
          lastName: r.createdByUser_lastName ?? '',
          email: r.createdByUser_email ?? '',
        }
      } : {}),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error GET /api/admin/rates/auto:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/admin/rates/auto  (crea 4 filas: 6/12/24/48)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const createdByUserId = auth.user.userId;

    const body = await request.json();
    const parsed = CreateAutoRateRangeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos inválidos', details: parsed.error.errors }, { status: 400 });
    }
    const { name, description, yearFrom, yearTo, isActive, terms } = parsed.data;

    // Validar solapamientos por cada plazo
    const TERMS = [6, 12, 24, 48];
    const overlaps: Array<{ term: number; ranges: Array<{ id: number; name: string; yearFrom: number; yearTo: number }> }> = [];

    for (const term of TERMS) {
      const rows = await prisma.$queryRaw<Array<{ id: number; name: string; yearFrom: number; yearTo: number }>>`
        SELECT id, name, yearFrom, yearTo
        FROM auto_interest_rate_ranges
        WHERE isActive = 1 AND termMonths = ${term} AND (
          (yearFrom <= ${yearFrom} AND yearTo >= ${yearFrom}) OR
          (yearFrom <= ${yearTo} AND yearTo >= ${yearTo}) OR
          (yearFrom >= ${yearFrom} AND yearTo <= ${yearTo})
        )
      `;
      if (rows.length > 0) {
        overlaps.push({ term, ranges: rows.map(r => ({ id: r.id, name: r.name, yearFrom: Number(r.yearFrom), yearTo: Number(r.yearTo) })) });
      }
    }

    if (overlaps.length > 0) {
      return NextResponse.json({ success: false, error: 'Rangos solapados para uno o más plazos', overlaps }, { status: 409 });
    }

    // Crear las 4 filas en transacción
    const created = await withTransaction(async (tx) => {
      for (const term of [6, 12, 24, 48]) {
        await tx.$executeRaw`
          INSERT INTO auto_interest_rate_ranges (name, description, yearFrom, yearTo, termMonths, interestRate, isActive, createdByUserId, createdAt, updatedAt)
          VALUES (${name}, ${description ?? null}, ${yearFrom}, ${yearTo}, ${term}, ${terms[term as 6 | 12 | 24 | 48]}, ${isActive ? 1 : 0}, ${createdByUserId}, NOW(), NOW())
        `;
      }
      const rows = await tx.$queryRaw<Array<{
        id: number; name: string; description: string | null; yearFrom: number; yearTo: number; termMonths: number; interestRate: any; isActive: number | boolean; createdAt: Date; updatedAt: Date;
      }>>`
        SELECT id, name, description, yearFrom, yearTo, termMonths, interestRate, isActive, createdAt, updatedAt
        FROM auto_interest_rate_ranges
        WHERE yearFrom = ${yearFrom} AND yearTo = ${yearTo}
        ORDER BY termMonths ASC
      `;
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description ?? undefined,
        yearFrom: Number(r.yearFrom),
        yearTo: Number(r.yearTo),
        termMonths: Number(r.termMonths),
        interestRate: typeof r.interestRate === 'string' ? parseFloat(r.interestRate) : Number(r.interestRate),
        isActive: typeof r.isActive === 'boolean' ? r.isActive : r.isActive === 1,
        createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
        updatedAt: (r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt)).toISOString(),
      }));
    });

    return NextResponse.json({ success: true, data: created, message: 'Rango AUTO creado para 6/12/24/48 meses' }, { status: 201 });
  } catch (error) {
    console.error('Error POST /api/admin/rates/auto:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
