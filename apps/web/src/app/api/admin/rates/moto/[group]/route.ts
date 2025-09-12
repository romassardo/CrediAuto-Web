import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withTransaction } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth-helpers';

// group param format: "<yearFrom>-<yearTo>" (e.g., 2015-2025)

const TermsPartialSchema = z.object({
  6: z.number().min(0.0001).max(1).optional(),
  12: z.number().min(0.0001).max(1).optional(),
  18: z.number().min(0.0001).max(1).optional(),
}).partial();

const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(255).optional(),
  yearFrom: z.number().int().min(1900).max(2050).optional(),
  yearTo: z.number().int().min(1900).max(2050).optional(),
  isActive: z.boolean().optional(),
  terms: TermsPartialSchema.optional(),
}).refine((d) => (d.yearFrom == null || d.yearTo == null) || (d.yearFrom <= d.yearTo), {
  message: 'El año desde debe ser menor o igual al año hasta',
  path: ['yearFrom'],
});

function parseGroupParam(group: string) {
  const m = group.match(/^(\d{4})-(\d{4})$/);
  if (!m) return null;
  const from = parseInt(m[1], 10);
  const to = parseInt(m[2], 10);
  if (isNaN(from) || isNaN(to)) return null;
  return { from, to };
}export async function PATCH(request: NextRequest, { params }: { params: Promise<{ group: string }> }) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { group } = await params;
    const parsedGroup = parseGroupParam(group);
    if (!parsedGroup) {
      return NextResponse.json({ success: false, error: 'Parámetro de grupo inválido. Use <yearFrom>-<yearTo>' }, { status: 400 });
    }

    const body = await request.json();
    const parse = UpdateGroupSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Datos inválidos', details: parse.error.errors }, { status: 400 });
    }

    const { name, description, yearFrom, yearTo, isActive, terms } = parse.data;

    // Cargar filas actuales del grupo
    const currentRows = await prisma.$queryRaw<Array<{
      id: number;
      name: string;
      description: string | null;
      yearFrom: number;
      yearTo: number;
      termMonths: number;
      interestRate: any;
      isActive: number | boolean;
    }>>`
      SELECT id, name, description, yearFrom, yearTo, termMonths, interestRate, isActive
      FROM moto_interest_rate_ranges
      WHERE yearFrom = ${parsedGroup.from} AND yearTo = ${parsedGroup.to}
      ORDER BY termMonths ASC
    `;

    if (currentRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Rango no encontrado' }, { status: 404 });
    }    const newFrom = yearFrom ?? Number(currentRows[0].yearFrom);
    const newTo = yearTo ?? Number(currentRows[0].yearTo);
    if (newFrom > newTo) {
      return NextResponse.json({ success: false, error: 'El año desde debe ser menor o igual al año hasta' }, { status: 400 });
    }

    // Validar solapamiento si cambia el rango y el estado final es activo (MOTO: 6/12/18)
    const TERMS = [6, 12, 18] as const;
    const overlaps: Array<{ term: number; ranges: Array<{ id: number; yearFrom: number; yearTo: number }> }> = [];

    for (const term of TERMS) {
      const row = currentRows.find(r => Number(r.termMonths) === term);
      const finalActive = isActive != null ? isActive : (typeof row!.isActive === 'boolean' ? row!.isActive : row!.isActive === 1);
      if (!finalActive) continue; // si queda inactivo, no valida solape

      const rows = await prisma.$queryRaw<Array<{ id: number; yearFrom: number; yearTo: number }>>`
        SELECT id, yearFrom, yearTo
        FROM moto_interest_rate_ranges
        WHERE termMonths = ${term}
          AND NOT (yearFrom = ${parsedGroup.from} AND yearTo = ${parsedGroup.to})
          AND isActive = 1
          AND (
            (yearFrom <= ${newFrom} AND yearTo >= ${newFrom}) OR
            (yearFrom <= ${newTo} AND yearTo >= ${newTo}) OR
            (yearFrom >= ${newFrom} AND yearTo <= ${newTo})
          )
      `;
      if (rows.length > 0) {
        overlaps.push({ term, ranges: rows.map(r => ({ id: r.id, yearFrom: Number(r.yearFrom), yearTo: Number(r.yearTo) })) });
      }
    }

    if (overlaps.length > 0) {
      return NextResponse.json({ success: false, error: 'Rangos solapados para uno o más plazos', overlaps }, { status: 409 });
    }    // Upsert de las 3 filas en transacción (UPDATE si existe, INSERT si falta)
    const updated = await withTransaction(async (tx) => {
      for (const term of TERMS) {
        const row = currentRows.find(r => Number(r.termMonths) === term);
        const currentRate = row ? (typeof row.interestRate === 'string' ? parseFloat(row.interestRate) : Number(row.interestRate)) : 0.45;
        const finalRate = (terms && terms[term as 6 | 12 | 18] != null) ? Number(terms[term as 6 | 12 | 18]) : currentRate;
        const finalName = name ?? row?.name ?? currentRows[0]?.name ?? 'Rango MOTO';
        const finalDescription = description ?? (row?.description ?? null);
        const finalIsActive = isActive != null
          ? (isActive ? 1 : 0)
          : (row ? (typeof row.isActive === 'boolean' ? (row.isActive ? 1 : 0) : (row.isActive === 1 ? 1 : 0)) : 1);

        if (row) {
          await tx.$executeRaw`
            UPDATE moto_interest_rate_ranges
            SET
              name = ${finalName},
              description = ${finalDescription},
              yearFrom = ${newFrom},
              yearTo = ${newTo},
              termMonths = ${term},
              interestRate = ${finalRate},
              isActive = ${finalIsActive},
              updatedAt = NOW()
            WHERE yearFrom = ${parsedGroup.from} AND yearTo = ${parsedGroup.to} AND termMonths = ${term}
          `;
        } else {
          await tx.$executeRaw`
            INSERT INTO moto_interest_rate_ranges (name, description, yearFrom, yearTo, termMonths, interestRate, isActive, createdByUserId, createdAt, updatedAt)
            VALUES (${finalName}, ${finalDescription}, ${newFrom}, ${newTo}, ${term}, ${finalRate}, ${finalIsActive}, ${auth.user?.userId ?? null}, NOW(), NOW())
          `;
        }
      }

      const rows = await tx.$queryRaw<Array<{
        id: number; name: string; description: string | null; yearFrom: number; yearTo: number; termMonths: number; interestRate: any; isActive: number | boolean; createdAt: Date; updatedAt: Date;
      }>>`
        SELECT id, name, description, yearFrom, yearTo, termMonths, interestRate, isActive, createdAt, updatedAt
        FROM moto_interest_rate_ranges
        WHERE yearFrom = ${newFrom} AND yearTo = ${newTo}
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

    return NextResponse.json({ success: true, data: updated, message: 'Rango MOTO actualizado' });
  } catch (error) {
    console.error('Error PATCH /api/admin/rates/moto/[group]:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}export async function DELETE(request: NextRequest, { params }: { params: Promise<{ group: string }> }) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { group } = await params;
    const parsedGroup = parseGroupParam(group);
    if (!parsedGroup) {
      return NextResponse.json({ success: false, error: 'Parámetro de grupo inválido. Use <yearFrom>-<yearTo>' }, { status: 400 });
    }

    const exists = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM moto_interest_rate_ranges WHERE yearFrom = ${parsedGroup.from} AND yearTo = ${parsedGroup.to} LIMIT 1
    `;
    if (exists.length === 0) {
      return NextResponse.json({ success: false, error: 'Rango no encontrado' }, { status: 404 });
    }

    await prisma.$executeRaw`
      DELETE FROM moto_interest_rate_ranges WHERE yearFrom = ${parsedGroup.from} AND yearTo = ${parsedGroup.to}
    `;

    return NextResponse.json({ success: true, message: 'Rango MOTO eliminado' });
  } catch (error) {
    console.error('Error DELETE /api/admin/rates/moto/[group]:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}