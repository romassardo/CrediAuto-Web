import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// POST /api/auth/logout
// - Revoca el refresh token actual (si existe y es válido)
// - Limpia cookies access_token y refresh_token
export async function POST(request: NextRequest) {
  try {
    const refreshCookie = request.cookies.get('refresh_token')?.value;

    let matchedTokenId: number | null = null;
    let userIdFromToken: number | null = null;

    if (refreshCookie) {
      // Intentar decodificar para conocer el userId y buscar candidatos
      try {
        const decoded: any = jwt.verify(refreshCookie, process.env.JWT_REFRESH_SECRET!);
        if (decoded?.userId && typeof decoded.userId === 'number') {
          userIdFromToken = decoded.userId;

          // Buscar tokens vigentes del usuario y comparar hash
          const uid = decoded.userId as number;
          const candidates = await prisma.refreshToken.findMany({
            where: {
              userId: uid,
              revokedAt: null,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
          });

          for (const c of candidates) {
            const ok = await bcrypt.compare(refreshCookie, c.tokenHash);
            if (ok) {
              matchedTokenId = c.id;
              break;
            }
          }
        }
      } catch {
        // Si está inválido/expirado, igualmente limpiaremos cookies abajo
      }
    }

    // Revocar en DB si encontramos el token
    if (matchedTokenId) {
      await prisma.refreshToken.update({
        where: { id: matchedTokenId },
        data: { revokedAt: new Date() },
      });

      // Audit log básico
      if (userIdFromToken) {
        await prisma.auditLog.create({
          data: {
            actorUserId: userIdFromToken,
            action: 'auth.logout',
            entityType: 'user',
            entityId: String(userIdFromToken),
            metadata: { reason: 'user_logout' },
          },
        });
      }
    }

    // Preparar respuesta y limpiar cookies
    const response = NextResponse.json({ success: true });

    const cookieBase = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // expira inmediatamente
    };

    response.cookies.set('access_token', '', cookieBase);
    response.cookies.set('refresh_token', '', cookieBase);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
