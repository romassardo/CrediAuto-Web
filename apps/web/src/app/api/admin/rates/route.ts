import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withTransaction } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth-helpers';

// Schema de validación para crear/actualizar rangos de tasas
const InterestRateRangeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  description: z.string().max(255, 'La descripción es muy larga').optional(),
  yearFrom: z.number()
    .int('El año debe ser un número entero')
    .min(1900, 'Año desde debe ser mayor a 1900')
    .max(2050, 'Año desde debe ser menor a 2050'),
  yearTo: z.number()
    .int('El año debe ser un número entero')
    .min(1900, 'Año hasta debe ser mayor a 1900')
    .max(2050, 'Año hasta debe ser menor a 2050'),
  interestRate: z.number()
    .min(0.01, 'La tasa debe ser mayor a 0.01%')
    .max(1, 'La tasa debe ser menor a 100%'),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).default(0)
}).refine(data => data.yearFrom <= data.yearTo, {
  message: 'El año desde debe ser menor o igual al año hasta',
  path: ['yearFrom']
});

// GET - Obtener todos los rangos de tasas
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    // Obtener rangos de tasas ordenados por prioridad y año usando SQL raw
    const rows = await prisma.$queryRaw<Array<{
      id: number;
      name: string;
      description: string | null;
      yearFrom: number;
      yearTo: number;
      interestRate: any;
      isActive: number | boolean;
      priority: number;
      createdAt: Date;
      updatedAt: Date;
      createdByUserId: number | null;
      createdByUser_id: number | null;
      createdByUser_firstName: string | null;
      createdByUser_lastName: string | null;
      createdByUser_email: string | null;
    }>>`
      SELECT
        irr.id,
        irr.name,
        irr.description,
        irr.yearFrom,
        irr.yearTo,
        irr.interestRate,
        irr.isActive,
        irr.priority,
        irr.createdAt,
        irr.updatedAt,
        irr.createdByUserId,
        u.id AS createdByUser_id,
        u.firstName AS createdByUser_firstName,
        u.lastName AS createdByUser_lastName,
        u.email AS createdByUser_email
      FROM interest_rate_ranges AS irr
      LEFT JOIN users AS u ON u.id = irr.createdByUserId
      ORDER BY irr.priority DESC, irr.yearFrom ASC
    `;

    const rateRanges = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      yearFrom: Number(r.yearFrom),
      yearTo: Number(r.yearTo),
      interestRate: typeof r.interestRate === 'string' ? parseFloat(r.interestRate) : Number(r.interestRate),
      isActive: typeof r.isActive === 'boolean' ? r.isActive : r.isActive === 1,
      priority: Number(r.priority),
      createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
      updatedAt: (r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt)).toISOString(),
      ...(r.createdByUser_id
        ? {
            createdByUser: {
              id: r.createdByUser_id,
              firstName: r.createdByUser_firstName ?? '',
              lastName: r.createdByUser_lastName ?? '',
              email: r.createdByUser_email ?? ''
            }
          }
        : {})
    }));

    return NextResponse.json({ success: true, data: rateRanges });

  } catch (error) {
    console.error('Error al obtener rangos de tasas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo rango de tasas
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = InterestRateRangeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verificar solapamiento de rangos activos con SQL raw
    const overlappingRows = await prisma.$queryRaw<Array<{ id: number; name: string; yearFrom: number; yearTo: number }>>`
      SELECT id, name, yearFrom, yearTo
      FROM interest_rate_ranges
      WHERE isActive = 1 AND (
        (yearFrom <= ${data.yearFrom} AND yearTo >= ${data.yearFrom}) OR
        (yearFrom <= ${data.yearTo} AND yearTo >= ${data.yearTo}) OR
        (yearFrom >= ${data.yearFrom} AND yearTo <= ${data.yearTo})
      )
    `;

    if (overlappingRows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `El rango ${data.yearFrom}-${data.yearTo} se solapa con: ${overlappingRows.map(r => `${r.name} (${r.yearFrom}-${r.yearTo})`).join(', ')}`,
          overlappingRanges: overlappingRows
        },
        { status: 409 }
      );
    }

    // Crear nuevo rango de tasas usando SQL raw dentro de una transacción
    const created = await withTransaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO interest_rate_ranges
          (name, description, yearFrom, yearTo, interestRate, isActive, priority, createdByUserId, createdAt, updatedAt)
        VALUES
          (${data.name}, ${data.description ?? null}, ${data.yearFrom}, ${data.yearTo}, ${data.interestRate}, ${data.isActive ? 1 : 0}, ${data.priority}, ${authResult.user.userId}, NOW(), NOW())
      `;

      const insertedIdRows = await tx.$queryRaw<Array<{ id: number }>>`SELECT LAST_INSERT_ID() AS id`;
      const insertedId = insertedIdRows[0]?.id;

      const resultRows = await tx.$queryRaw<Array<{
        id: number;
        name: string;
        description: string | null;
        yearFrom: number;
        yearTo: number;
        interestRate: any;
        isActive: number | boolean;
        priority: number;
        createdAt: Date;
        updatedAt: Date;
        createdByUserId: number | null;
        createdByUser_id: number | null;
        createdByUser_firstName: string | null;
        createdByUser_lastName: string | null;
        createdByUser_email: string | null;
      }>>`
        SELECT
          irr.id,
          irr.name,
          irr.description,
          irr.yearFrom,
          irr.yearTo,
          irr.interestRate,
          irr.isActive,
          irr.priority,
          irr.createdAt,
          irr.updatedAt,
          irr.createdByUserId,
          u.id AS createdByUser_id,
          u.firstName AS createdByUser_firstName,
          u.lastName AS createdByUser_lastName,
          u.email AS createdByUser_email
        FROM interest_rate_ranges AS irr
        LEFT JOIN users AS u ON u.id = irr.createdByUserId
        WHERE irr.id = ${insertedId}
      `;

      const r = resultRows[0];
      return r
        ? {
            id: r.id,
            name: r.name,
            description: r.description ?? undefined,
            yearFrom: Number(r.yearFrom),
            yearTo: Number(r.yearTo),
            interestRate: typeof r.interestRate === 'string' ? parseFloat(r.interestRate) : Number(r.interestRate),
            isActive: typeof r.isActive === 'boolean' ? r.isActive : r.isActive === 1,
            priority: Number(r.priority),
            createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
            updatedAt: (r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt)).toISOString(),
            ...(r.createdByUser_id
              ? {
                  createdByUser: {
                    id: r.createdByUser_id,
                    firstName: r.createdByUser_firstName ?? '',
                    lastName: r.createdByUser_lastName ?? '',
                    email: r.createdByUser_email ?? ''
                  }
                }
              : {})
          }
        : null;
    });

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: 'Rango de tasas creado exitosamente'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error al crear rango de tasas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}