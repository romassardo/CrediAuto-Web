import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withTransaction } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth-helpers';

// Schema de validación para actualizar rangos de tasas
const UpdateInterestRateRangeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  description: z.string().max(255, 'La descripción es muy larga').optional(),
  yearFrom: z.number()
    .int('El año debe ser un número entero')
    .min(1900, 'Año desde debe ser mayor a 1900')
    .max(2050, 'Año desde debe ser menor a 2050')
    .optional(),
  yearTo: z.number()
    .int('El año debe ser un número entero')
    .min(1900, 'Año hasta debe ser mayor a 1900')
    .max(2050, 'Año hasta debe ser menor a 2050')
    .optional(),
  interestRate: z.number()
    .min(0.01, 'La tasa debe ser mayor a 0.01%')
    .max(1, 'La tasa debe ser menor a 100%')
    .optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).optional()
});

// GET - Obtener un rango de tasas específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación de admin
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener rango de tasas específico usando SQL raw
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
      WHERE irr.id = ${id}
      LIMIT 1
    `;

    const r = rows[0];
    if (!r) {
      return NextResponse.json(
        { success: false, error: 'Rango de tasas no encontrado' },
        { status: 404 }
      );
    }

    const rateRange = {
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
    };

    return NextResponse.json({ success: true, data: rateRange });

  } catch (error) {
    console.error('Error al obtener rango de tasas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
// PATCH - Actualizar un rango de tasas
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación de admin
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validar datos de entrada
    const validationResult = UpdateInterestRateRangeSchema.safeParse(body);
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

    // Verificar que el rango existe (SQL raw)
    const existingRows = await prisma.$queryRaw<Array<{
      id: number;
      name: string;
      description: string | null;
      yearFrom: number;
      yearTo: number;
      interestRate: any;
      isActive: number | boolean;
      priority: number;
    }>>`
      SELECT id, name, description, yearFrom, yearTo, interestRate, isActive, priority
      FROM interest_rate_ranges
      WHERE id = ${id}
      LIMIT 1
    `;

    const existing = existingRows[0];
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Rango de tasas no encontrado' },
        { status: 404 }
      );
    }

    // Calcular nuevos valores (mantener existentes si no se envían)
    const newName = data.name ?? existing.name;
    const newDescription = data.description ?? existing.description ?? null;
    const newYearFrom = data.yearFrom ?? Number(existing.yearFrom);
    const newYearTo = data.yearTo ?? Number(existing.yearTo);
    const existingRate = typeof existing.interestRate === 'string' ? parseFloat(existing.interestRate) : Number(existing.interestRate);
    const newInterestRate = data.interestRate ?? existingRate;
    const existingActive = typeof existing.isActive === 'boolean' ? existing.isActive : existing.isActive === 1;
    const newIsActive = data.isActive ?? existingActive;
    const newPriority = data.priority ?? Number(existing.priority);

    // Validación yearFrom <= yearTo si se actualizan
    if (newYearFrom > newYearTo) {
      return NextResponse.json(
        { success: false, error: 'El año desde debe ser menor o igual al año hasta' },
        { status: 400 }
      );
    }

    // Si se actualizan los años, verificar solapamiento con otros rangos activos (excluyendo el actual)
    if (data.yearFrom !== undefined || data.yearTo !== undefined) {
      const overlapping = await prisma.$queryRaw<Array<{ id: number; name: string; yearFrom: number; yearTo: number }>>`
        SELECT id, name, yearFrom, yearTo
        FROM interest_rate_ranges
        WHERE id <> ${id} AND isActive = 1 AND (
          (yearFrom <= ${newYearFrom} AND yearTo >= ${newYearFrom}) OR
          (yearFrom <= ${newYearTo} AND yearTo >= ${newYearTo}) OR
          (yearFrom >= ${newYearFrom} AND yearTo <= ${newYearTo})
        )
      `;

      if (overlapping.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'El rango de años se solapa con rangos existentes',
            overlappingRanges: overlapping.map(r => ({ id: r.id, name: r.name, yearFrom: r.yearFrom, yearTo: r.yearTo }))
          },
          { status: 409 }
        );
      }
    }

    // Actualizar y devolver el registro actualizado dentro de una transacción
    const updatedRateRange = await withTransaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE interest_rate_ranges
        SET
          name = ${newName},
          description = ${newDescription},
          yearFrom = ${newYearFrom},
          yearTo = ${newYearTo},
          interestRate = ${newInterestRate},
          isActive = ${newIsActive ? 1 : 0},
          priority = ${newPriority},
          updatedAt = NOW()
        WHERE id = ${id}
      `;

      const rows = await tx.$queryRaw<Array<{
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
        WHERE irr.id = ${id}
        LIMIT 1
      `;

      const r = rows[0];
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

    return NextResponse.json({
      success: true,
      data: updatedRateRange,
      message: 'Rango de tasas actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar rango de tasas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un rango de tasas
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación de admin
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar existencia con SQL raw
    const existsRows = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM interest_rate_ranges WHERE id = ${id} LIMIT 1
    `;

    if (existsRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rango de tasas no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar con SQL raw
    await prisma.$executeRaw`
      DELETE FROM interest_rate_ranges WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Rango de tasas eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar rango de tasas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}