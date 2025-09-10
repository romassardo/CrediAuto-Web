import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

interface AuthResult {
  success: boolean;
  error?: string;
  status?: number;
  user?: {
    userId: number;
    role: string;
    dealerId?: number;
  };
}

// Función para verificar autenticación de admin
export async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Primero intentar obtener desde headers del middleware
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');
    
    if (userRole === 'ADMIN' && userId) {
      return {
        success: true,
        user: {
          userId: parseInt(userId),
          role: userRole
        }
      };
    }

    // Fallbacks: cookies y/o Authorization Bearer
    const accessToken = request.cookies.get('access_token')?.value || null;
    const refreshToken = request.cookies.get('refresh_token')?.value || null;

    // 1) Intentar con access_token
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        if (payload.role === 'ADMIN') {
          return {
            success: true,
            user: {
              userId: payload.userId as number,
              role: payload.role as string,
              dealerId: payload.dealerId as number | undefined,
            },
          };
        }
        return { success: false, error: 'Acceso denegado. Se requieren permisos de administrador', status: 403 };
      } catch (_e) {
        // seguimos con refresh
      }
    }

    // 2) Intentar con refresh_token
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
        if (payload.role === 'ADMIN') {
          return {
            success: true,
            user: {
              userId: payload.userId as number,
              role: payload.role as string,
              dealerId: payload.dealerId as number | undefined,
            },
          };
        }
        return { success: false, error: 'Acceso denegado. Se requieren permisos de administrador', status: 403 };
      } catch (_e) {
        // seguimos con Authorization
      }
    }

    // 3) Intentar con Authorization: Bearer ...
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    if (bearer) {
      // Intentar primero con access, luego con refresh
      try {
        const { payload } = await jwtVerify(bearer, JWT_SECRET);
        if (payload.role === 'ADMIN') {
          return {
            success: true,
            user: {
              userId: payload.userId as number,
              role: payload.role as string,
              dealerId: payload.dealerId as number | undefined,
            },
          };
        }
        return { success: false, error: 'Acceso denegado. Se requieren permisos de administrador', status: 403 };
      } catch (_e1) {
        try {
          const { payload } = await jwtVerify(bearer, JWT_REFRESH_SECRET);
          if (payload.role === 'ADMIN') {
            return {
              success: true,
              user: {
                userId: payload.userId as number,
                role: payload.role as string,
                dealerId: payload.dealerId as number | undefined,
              },
            };
          }
          return { success: false, error: 'Acceso denegado. Se requieren permisos de administrador', status: 403 };
        } catch (_e2) {
          // nada
        }
      }
    }

    return {
      success: false,
      error: 'Token de acceso no encontrado',
      status: 401,
    };

  } catch (error) {
    console.error('Error en verificación de auth admin:', error);
    return {
      success: false,
      error: 'Token inválido',
      status: 401
    };
  }
}