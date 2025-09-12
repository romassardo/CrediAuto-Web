import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Schema de validación para el año del vehículo
const YearQuerySchema = z.object({
  year: z.string().transform((val) => {
    const num = parseInt(val);
    if (isNaN(num)) throw new Error('Año inválido');
    return num;
  }).refine((num) => num >= 1900 && num <= 2050, {
    message: 'El año debe estar entre 1900 y 2050'
  })
});

// GET - Obtener tasa de interés para un año específico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    if (!yearParam) {
      return NextResponse.json(
        { success: false, error: 'El parámetro año es requerido' },
        { status: 400 }
      );
    }

    // Validar el año
    const validationResult = YearQuerySchema.safeParse({ year: yearParam });
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Año inválido',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const year = validationResult.data.year;
    console.log(`🔍 Buscando tasa para año: ${year}`);

    // Buscar el rango de tasas usando SQL raw (workaround para cliente Prisma no regenerado)
    const rateRangeResult = await prisma.$queryRaw`
      SELECT id, name, description, yearFrom, yearTo, interestRate, priority
      FROM interest_rate_ranges 
      WHERE isActive = 1 
        AND yearFrom <= ${year} 
        AND yearTo >= ${year}
      ORDER BY priority DESC 
      LIMIT 1
    `;
    
    const rateRange = Array.isArray(rateRangeResult) && rateRangeResult.length > 0 
      ? rateRangeResult[0] as any 
      : null;

    console.log(`🎯 Rango encontrado para año ${year}:`, rateRange);

    if (!rateRange) {
      console.log(`❌ No se encontró rango para año ${year}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `No se encontró una tasa configurada para vehículos del año ${year}`,
          year
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        year,
        interestRate: rateRange.interestRate,
        unit: 'TNA',
        rateRange: {
          id: rateRange.id,
          name: rateRange.name,
          description: rateRange.description,
          yearFrom: rateRange.yearFrom,
          yearTo: rateRange.yearTo,
          priority: rateRange.priority
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener tasa por año:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}