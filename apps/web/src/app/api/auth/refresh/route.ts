import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Utilidad local para generar tokens (mismo formato que /api/auth/login)
function generateTokens(userId: number, role: string, dealerId?: number) {
  const payload: any = { userId, role };
  if (typeof dealerId === 'number') payload.dealerId = dealerId;

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 12);
}

export async function POST(request: NextRequest) {
  try {
    const rCookie = request.cookies.get('refresh_token')?.value;
    if (!rCookie) {
      return NextResponse.json({ error: 'Falta refresh token' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(rCookie, process.env.JWT_REFRESH_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: 'Refresh token inválido o expirado' }, { status: 401 });
    }

    const userId = decoded.userId as number | undefined;
    if (!userId) {
      return NextResponse.json({ error: 'Token sin identidad' }, { status: 401 });
    }

    // Validar usuario vigente
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { dealer: { select: { id: true, status: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }
    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Usuario suspendido' }, { status: 403 });
    }
    if (user.role === 'DEALER' && user.dealer?.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Concesionario no aprobado' }, { status: 403 });
    }

    // Buscar registro de refresh token vigente y comparar hash
    const candidates = await prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    let matched: { id: number } | null = null;
    for (const c of candidates) {
      const ok = await bcrypt.compare(rCookie, c.tokenHash);
      if (ok) {
        matched = { id: c.id };
        break;
      }
    }

    if (!matched) {
      // Opcional: invalidar todos los tokens si hay sospecha de robo
      return NextResponse.json({ error: 'Refresh token no reconocido' }, { status: 401 });
    }

    // Generar nuevos tokens
    let dealerIdForToken: number | undefined = undefined;
    if (user.role === 'DEALER' || user.role === 'EJECUTIVO_CUENTAS') {
      dealerIdForToken = user.dealerId || undefined;
    }
    const { accessToken, refreshToken } = generateTokens(user.id, user.role, dealerIdForToken);

    // Rotación segura: crear nuevo registro, revocar el anterior y enlazar replacedBy
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const newHash = await hashToken(refreshToken);
    const newRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent,
        ip,
      },
      select: { id: true },
    });

    await prisma.refreshToken.update({
      where: { id: matched.id },
      data: { revokedAt: new Date(), replacedByTokenId: newRecord.id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'auth.refresh',
        entityType: 'user',
        entityId: String(user.publicId),
        metadata: { ip, ua: userAgent },
        ip: typeof ip === 'string' ? ip : 'unknown',
      },
    });

    // Preparar respuesta con nuevas cookies
    const response = NextResponse.json({ success: true });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 });
    response.cookies.set('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
