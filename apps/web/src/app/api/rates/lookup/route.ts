import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// GET /api/rates/lookup?product=AUTO|MOTO&year=YYYY&term=6|12|24|48
// Devuelve la tasa configurada para el producto, año y plazo. Sin solapamientos.
// Si aún no existen las tablas por producto (AUTO/MOTO), hace fallback a interest_rate_ranges (solo por año).

const QuerySchema = z.object({
  product: z.enum(['AUTO', 'MOTO']),
  year: z.coerce.number().int().min(1900).max(2050),
  term: z.coerce.number().int().refine((v) => [6, 12, 18, 24, 36, 48].includes(v), {
    message: 'term inválido (válidos: 6, 12, 18, 24, 36, 48)'
  })
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      product: searchParams.get('product') ?? undefined,
      year: searchParams.get('year') ?? undefined,
      term: searchParams.get('term') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Parámetros inválidos', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { product, year, term } = parsed.data;

    // Validación de términos por producto
    if (product === 'MOTO' && ![6, 12, 18].includes(term)) {
      return NextResponse.json(
        { success: false, error: 'term inválido para MOTO (válidos: 6, 12, 18)' },
        { status: 400 }
      );
    }
    if (product === 'AUTO' && ![6, 12, 18, 24, 36, 48].includes(term)) {
      return NextResponse.json(
        { success: false, error: 'term inválido para AUTO (válidos: 6, 12, 18, 24, 36, 48)' },
        { status: 400 }
      );
    }

    // Tablas separadas por producto (recomendación del negocio)
    const tableName = product === 'AUTO' ? 'auto_interest_rate_ranges' : 'moto_interest_rate_ranges';

    let found: any = null;
    let usedFallback = false;

    // Intentamos buscar en la tabla por producto y plazo.
    try {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT id, name, description, yearFrom, yearTo, termMonths, interestRate, isActive
         FROM ${tableName}
         WHERE isActive = 1 AND termMonths = ? AND yearFrom <= ? AND yearTo >= ?
         LIMIT 1`,
        term, year, year
      );
      if (Array.isArray(rows) && rows.length > 0) {
        found = rows[0];
      }
    } catch (e) {
      usedFallback = true; // probablemente la tabla aún no existe
    }

    if (!found) {
      // Solo permitimos fallback a la tabla antigua para AUTO.
      if (product === 'AUTO') {
        const rows = await prisma.$queryRaw<
          Array<{ id: number; name: string; description: string | null; yearFrom: number; yearTo: number; interestRate: any; priority?: number }>
        >`SELECT id, name, description, yearFrom, yearTo, interestRate, priority
          FROM interest_rate_ranges
          WHERE isActive = 1 AND yearFrom <= ${year} AND yearTo >= ${year}
          ORDER BY priority DESC
          LIMIT 1`;

        if (rows.length === 0) {
          return NextResponse.json(
            { success: false, error: `No hay tasa configurada para ${product} año ${year}${usedFallback ? ' (tablas nuevas no disponibles)' : ''}` },
            { status: 404 }
          );
        }

        const r = rows[0];
        const rate = typeof r.interestRate === 'string' ? parseFloat(r.interestRate) : Number(r.interestRate);
        console.log(`[rates.lookup] Fallback AUTO interest_rate_ranges match → year=${year}, term=${term}, rate=${rate}`);
        return NextResponse.json({
          success: true,
          data: {
            product,
            year,
            term,
            interestRate: rate,
            unit: 'TNA',
            rateRange: {
              id: r.id,
              name: r.name,
              description: r.description ?? undefined,
              yearFrom: Number(r.yearFrom),
              yearTo: Number(r.yearTo),
              priority: typeof r.priority === 'number' ? r.priority : undefined,
            },
            fallback: true,
          },
        });
      }

      // Para MOTO (u otros productos futuros), si no hay tabla nueva o no hay match, 404.
      return NextResponse.json(
        { success: false, error: `No hay tasa configurada para ${product} año ${year}${usedFallback ? ' (tablas nuevas no disponibles)' : ''}` },
        { status: 404 }
      );
    }

    // Estructura nueva (por producto + plazo)
    const rate = typeof found.interestRate === 'string' ? parseFloat(found.interestRate) : Number(found.interestRate);
    console.log(`[rates.lookup] ${tableName} match → product=${product}, year=${year}, term=${term}, rate=${rate}`);
    return NextResponse.json({
      success: true,
      data: {
        product,
        year,
        term,
        interestRate: rate,
        unit: 'TNA',
        rateRange: {
          id: found.id,
          name: found.name,
          description: found.description ?? undefined,
          yearFrom: Number(found.yearFrom),
          yearTo: Number(found.yearTo),
          termMonths: Number(found.termMonths),
        },
        fallback: false,
      },
    });
  } catch (error) {
    console.error('Error en /api/rates/lookup:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
