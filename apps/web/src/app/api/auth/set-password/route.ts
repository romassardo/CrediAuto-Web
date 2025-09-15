import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 15;

const setPasswordSchema = z.object({
  token: z.string().min(16, 'Token inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = setPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Buscar el token por hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const now = new Date();
    const prt = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      include: { user: true },
    });

    if (!prt || !prt.user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Actualizar contraseña y activar usuario si corresponde
    const passwordHash = await bcrypt.hash(password, 12);

    const updatedUser = await prisma.user.update({
      where: { id: prt.userId },
      data: {
        passwordHash,
        status: prt.user.status === 'INVITED' || prt.user.status === 'PENDING' ? 'ACTIVE' : prt.user.status,
        // Opcional: invalidar refresh tokens existentes
        // refreshTokens: { updateMany: { where: { revokedAt: null }, data: { revokedAt: now } } },
      },
    });

    // Marcar token como consumido y opcionalmente borrar otros tokens del mismo usuario
    await prisma.passwordResetToken.update({
      where: { id: prt.id },
      data: { consumedAt: now },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: updatedUser.id,
        action: 'auth.set_password',
        entityType: 'user',
        entityId: String(updatedUser.id),
        metadata: { method: 'invite-link' },
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error inesperado';
    console.error('[POST /api/auth/set-password] Error:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
