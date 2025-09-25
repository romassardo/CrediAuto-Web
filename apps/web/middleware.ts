import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { debugAuth } from '@/lib/logger'

// Rutas protegidas y públicas
const protectedRoutes = ['/admin', '/portal']
const publicRoutes = ['/login', '/signup', '/']
const adminRoutes = ['/admin']
const portalRoutes = ['/portal']

// Claves para verificar tokens
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret')

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  // Permitir el acceso directo a archivos estáticos subidos sin pasar por el middleware
  // Esto evita redirecciones cuando el token está ausente/expirado y asegura que
  // /uploads/* se sirva como contenido estático.
  if (path.startsWith('/uploads/')) {
    return NextResponse.next()
  }
  // Excluir la nueva ruta de archivos para servir descargas/visualizaciones sin pasar por auth middleware
  if (path.startsWith('/api/files/')) {
    return NextResponse.next()
  }

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path === route) || path === '/'
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route))
  const isPortalRoute = portalRoutes.some(route => path.startsWith(route))
  const isApiRoute = path.startsWith('/api')

  // Obtener tokens de las cookies (access y refresh por separado)
  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value
  // Permitir Authorization Bearer como alternativa (por ejemplo, cuando cookies no se envían por HTTP)
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
  const bearerToken = authHeader && authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null

  // Si no hay token y es ruta protegida, redirigir a login
  if (isProtectedRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Si hay token (cookies o Authorization), verificar su validez y permisos
  if (accessToken || refreshToken || bearerToken) {
    let payload: any | null = null
    let tokenType: 'access' | 'refresh' | 'bearer' | null = null

    // Intentar validar access_token primero
    if (accessToken) {
      try {
        const result = await jwtVerify(accessToken, JWT_SECRET)
        payload = result.payload
        tokenType = 'access'
      } catch {
        // Si el access token no es válido o expiró, probar con refresh_token
        if (refreshToken) {
          try {
            const result = await jwtVerify(refreshToken, JWT_REFRESH_SECRET)
            payload = result.payload
            tokenType = 'refresh'
          } catch {
            // ambos tokens inválidos
          }
        } else if (bearerToken) {
          try {
            const result = await jwtVerify(bearerToken, JWT_SECRET)
            payload = result.payload
            tokenType = 'bearer'
          } catch {
            // bearer inválido
          }
        }
      }
    } else if (refreshToken) {
      try {
        const result = await jwtVerify(refreshToken, JWT_REFRESH_SECRET)
        payload = result.payload
        tokenType = 'refresh'
      } catch {
        // refresh inválido
      }
    } else if (bearerToken) {
      try {
        const result = await jwtVerify(bearerToken, JWT_SECRET)
        payload = result.payload
        tokenType = 'bearer'
      } catch {
        // bearer inválido
      }
    }

    if (!payload) {
      // Tokens presentes pero inválidos
      if (isApiRoute) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
      const response = NextResponse.redirect(new URL('/', req.url))
      response.cookies.delete('access_token')
      return response
    }

    const userRole = payload.role as string
    const userId = payload.userId as number

    // Para API routes: solo verificar autenticación. Importante: no modificar el request en métodos con body (POST/PATCH/PUT/DELETE)
    // porque puede perderse el stream del body y causar "TypeError: Failed to fetch" en el cliente.
    if (isApiRoute) {
      const method = req.method
      if (method === 'GET' || method === 'HEAD') {
        debugAuth('🔍 Middleware API:', path, { userId, userRole, dealerId: (payload as any).dealerId, tokenType, method })
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('x-user-id', userId.toString())
        requestHeaders.set('x-user-role', userRole)
        if ((payload as any).dealerId) {
          requestHeaders.set('x-user-dealer-id', String((payload as any).dealerId))
        }
        return NextResponse.next({
          request: { headers: requestHeaders },
        })
      }
      // Para métodos con body, si la autenticación proviene de Bearer o cookies ya verificadas,
      // dejamos pasar sin alterar request para preservar el body
      return NextResponse.next()
    }

    // Verificar permisos específicos por ruta (solo para páginas, no API)
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (isPortalRoute && !['DEALER', 'EJECUTIVO_CUENTAS'].includes(userRole)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Si está autenticado y trata de acceder a rutas públicas, redirigir al dashboard apropiado
    if (isPublicRoute && path === '/') {
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      } else if (['DEALER', 'EJECUTIVO_CUENTAS'].includes(userRole)) {
        return NextResponse.redirect(new URL('/portal/dashboard', req.url))
      }
    }

    const method2 = req.method
    if (method2 === 'GET' || method2 === 'HEAD') {
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-id', userId.toString())
      requestHeaders.set('x-user-role', userRole)
      if ((payload as any).dealerId) {
        requestHeaders.set('x-user-dealer-id', String((payload as any).dealerId))
      }
      return NextResponse.next({
        request: { headers: requestHeaders },
      })
    }
    // Para métodos con body fuera de /api, no alteramos el request para no interferir con el stream del body
    return NextResponse.next()
  }

  // Si no hay token y es API route protegida, devolver 401
  if (isApiRoute && (path.startsWith('/api/admin') || path.startsWith('/api/loan-applications') || path.startsWith('/api/dealer'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  return NextResponse.next()
}

// Configurar en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas incluyendo API routes para agregar headers de usuario
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|uploads).*)',
    '/api/:path*'
  ],
}
