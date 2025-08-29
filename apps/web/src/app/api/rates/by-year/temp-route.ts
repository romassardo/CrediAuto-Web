import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Rangos temporales hardcodeados hasta que Prisma funcione
const TEMP_RATE_RANGES = [
  {
    id: 1,
    name: 'Vehículos Antiguos (1990-2010)',
    description: 'Tasa para vehículos de 15+ años',
    yearFrom: 1990,
    yearTo: 2010,
    interestRate: 0.6000, // 60%
    isActive: true,
    priority: 1
  },
  {
    id: 2,
    name: 'Vehículos Intermedios (2011-2018)',
    description: 'Tasa para vehículos de 7-14 años',
    yearFrom: 2011,
    yearTo: 2018,
    interestRate: 0.4500, // 45%
    isActive: true,
    priority: 2
  },
  {
    id: 3,
    name: 'Vehículos Nuevos (2019-2025)',
    description: 'Tasa para vehículos de 0-6 años',
    yearFrom: 2019,
    yearTo: 2025,
    interestRate: 0.3500, // 35%
    isActive: true,
    priority: 3
  }
];

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

// GET - Obtener tasa de interés para un año específico (versión temporal)
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
    console.log(`🔍 [TEMP] Buscando tasa para año: ${year}`);

    // Buscar en rangos temporales
    const rateRange = TEMP_RATE_RANGES.find(range => 
      range.isActive && 
      range.yearFrom <= year && 
      range.yearTo >= year
    );

    if (!rateRange) {
      console.log(`❌ [TEMP] No se encontró rango para año ${year}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `No se encontró una tasa configurada para vehículos del año ${year}`,
          year,
          availableRanges: TEMP_RATE_RANGES
        },
        { status: 404 }
      );
    }

    console.log(`✅ [TEMP] Tasa encontrada: ${rateRange.name} - ${(rateRange.interestRate * 100).toFixed(1)}%`);

    return NextResponse.json({
      success: true,
      data: {
        year,
        interestRate: rateRange.interestRate,
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
    console.error('❌ [TEMP] Error al obtener tasa por año:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
