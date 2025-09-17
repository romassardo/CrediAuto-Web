import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

// Normaliza la IP del cliente (primer IP de X-Forwarded-For, recortada a 45)
function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  const xri = request.headers.get('x-real-ip');
  const raw = (xff || xri || 'unknown').toString();
  const first = raw.split(',')[0]?.trim() || 'unknown';
  return first.length > 45 ? first.slice(0, 45) : first;
}

export async function GET(request: NextRequest) {
  try {
    // 1) Preferir headers inyectados por el middleware (funciona incluso si access_token expiró y se usó refresh_token)
    const headerUserId = request.headers.get('x-user-id');
    let userId: number | null = headerUserId ? Number(headerUserId) : null;

    // 2) Fallback: verificar cookie access_token; si no está, intentar con refresh_token; último intento: Authorization Bearer
    if (!userId) {
      const accessToken = request.cookies.get('access_token')?.value;
      const refreshToken = request.cookies.get('refresh_token')?.value;

      if (accessToken) {
        try {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          userId = (payload.userId as number) ?? null;
        } catch (_e) {
          // access_token inválido, intentamos con refresh
        }

      }

      if (!userId && refreshToken) {
        try {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          userId = (payload.userId as number) ?? null;
        } catch (_e) {
          // refresh_token inválido, seguimos intentando
        }
      }

      if (!userId) {
        const auth = request.headers.get('authorization') || request.headers.get('Authorization');
        const bearer = auth && auth.startsWith('Bearer ')
          ? auth.slice('Bearer '.length)
          : null;
        if (bearer) {
          try {
            const { payload } = await jwtVerify(bearer, JWT_SECRET);
            userId = (payload.userId as number) ?? null;
          } catch (_e) {}
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: 'Token no encontrado' },
          { status: 401 }
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener datos del usuario desde la base de datos
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        deletedAt: null 
      },
      select: {
        id: true,
        publicId: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        dealerId: true,
        dealer: {
          select: {
            id: true,
            publicId: true,
            tradeName: true,
            status: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 403 }
      );
    }

    // Si es un ejecutivo, verificar que el dealer esté activo
    if (user.role === 'EJECUTIVO_CUENTAS' && user.dealer?.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Concesionario no aprobado' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.publicId,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        dealerId: user.dealerId,
        dealer: user.dealer ? {
          id: user.dealer.publicId,
          businessName: user.dealer.tradeName,
          status: user.dealer.status,
        } : null,
      },
    });

  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/me -> Actualiza email y/o phone del usuario autenticado
export async function PATCH(request: NextRequest) {
  try {
    // 1) Resolver identidad (mismo patrón que GET)
    const headerUserId = request.headers.get('x-user-id');
    let userId: number | null = headerUserId ? Number(headerUserId) : null;

    if (!userId) {
      const accessToken = request.cookies.get('access_token')?.value;
      const refreshToken = request.cookies.get('refresh_token')?.value;

      if (accessToken) {
        try {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          userId = (payload.userId as number) ?? null;
        } catch (_e) {}
      }

      if (!userId && refreshToken) {
        try {
          const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          userId = (payload.userId as number) ?? null;
        } catch (_e) {}
      }

      if (!userId) {
        const auth = request.headers.get('authorization') || request.headers.get('Authorization');
        const bearer = auth && auth.startsWith('Bearer ')
          ? auth.slice('Bearer '.length)
          : null;
        if (bearer) {
          try {
            const { payload } = await jwtVerify(bearer, JWT_SECRET);
            userId = (payload.userId as number) ?? null;
          } catch (_e) {}
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2) Validar input
    const body = await request.json().catch(() => ({}));
    const schema = z.object({
      email: z.string().email('Email inválido').optional(),
      phone: z.string().min(6, 'Teléfono muy corto').max(50, 'Teléfono muy largo').nullable().optional(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email, phone } = parsed.data;

    // 3) Verificar usuario y preparar cambios
    const current = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, publicId: true, email: true, phone: true, status: true, role: true, dealerId: true,
        dealer: { select: { id: true, publicId: true, tradeName: true, status: true } } },
    });
    if (!current) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (current.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 403 });
    }

    const dataToUpdate: { email?: string; phone?: string | null } = {};
    if (typeof email === 'string' && email && email !== current.email) dataToUpdate.email = email;
    if (typeof phone !== 'undefined' && phone !== current.phone) dataToUpdate.phone = phone ?? null;

    if (!('email' in dataToUpdate) && !('phone' in dataToUpdate)) {
      return NextResponse.json({ success: true, user: {
        id: current.publicId,
        email: current.email,
        phone: current.phone,
        firstName: (current as any).firstName,
        lastName: (current as any).lastName,
        role: current.role,
        status: current.status,
        dealerId: current.dealerId,
        dealer: current.dealer ? {
          id: current.dealer.publicId,
          businessName: current.dealer.tradeName,
          status: current.dealer.status,
        } : null,
      }});
    }

    // 4) Actualizar y devolver user normalizado como en GET
    try {
      await prisma.user.update({
        where: { id: current.id },
        data: dataToUpdate,
      });
    } catch (e: any) {
      // Prisma unique constraint
      if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('email')) {
        return NextResponse.json({ error: 'El email ya está en uso' }, { status: 409 });
      }
      throw e;
    }

    const updated = await prisma.user.findFirst({
      where: { id: current.id },
      select: {
        id: true, publicId: true, email: true, phone: true, firstName: true, lastName: true, role: true, status: true, dealerId: true,
        dealer: { select: { id: true, publicId: true, tradeName: true, status: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: current.id,
        action: 'user.profile_updated',
        entityType: 'user',
        entityId: current.publicId,
        metadata: { changed: Object.keys(dataToUpdate) },
        ip: getClientIp(request),
      },
    });

    return NextResponse.json({
      success: true,
      user: updated ? {
        id: updated.publicId,
        email: updated.email,
        phone: updated.phone,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        status: updated.status,
        dealerId: updated.dealerId,
        dealer: updated.dealer ? {
          id: updated.dealer.publicId,
          businessName: updated.dealer.tradeName,
          status: updated.dealer.status,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error('PATCH /api/auth/me error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}