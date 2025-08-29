import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

    // Fallback: verificar desde cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Token de acceso no encontrado',
        status: 401
      };
    }

    // Verificar JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Acceso denegado. Se requieren permisos de administrador',
        status: 403
      };
    }

    return {
      success: true,
      user: {
        userId: payload.userId as number,
        role: payload.role as string,
        dealerId: payload.dealerId as number | undefined
      }
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