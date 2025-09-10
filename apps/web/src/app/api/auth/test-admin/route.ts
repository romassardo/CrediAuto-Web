import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Endpoint temporal para crear sesión de admin de prueba
export async function POST(request: NextRequest) {
  try {
    // Crear payload de admin de prueba
    const payload = {
      userId: 999,
      email: 'admin@test.com',
      role: 'ADMIN',
      name: 'Admin Test'
    };

    // Crear tokens JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .setIssuedAt()
      .sign(secret);

    const refreshToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(refreshSecret);

    // Crear respuesta con cookies
    const response = NextResponse.json({
      success: true,
      message: 'Sesión de admin de prueba creada',
      user: payload
    });

    // Configurar cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutos
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error creando sesión de prueba:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
