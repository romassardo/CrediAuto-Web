import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Rutas protegidas y públicas
const protectedRoutes = ['/admin', '/portal']
const publicRoutes = ['/login', '/signup', '/']
const adminRoutes = ['/admin']
const portalRoutes = ['/portal']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path === route) || path === '/'
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route))
  const isPortalRoute = portalRoutes.some(route => path.startsWith(route))
  const isApiRoute = path.startsWith('/api')

  // Obtener token de las cookies (probar access_token y refresh_token)
  const token = req.cookies.get('access_token')?.value || req.cookies.get('refresh_token')?.value

  // Si no hay token y es ruta protegida, redirigir a login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Si hay token, verificar su validez y permisos
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
      const { payload } = await jwtVerify(token, secret)
      
      const userRole = payload.role as string
      const userId = payload.userId as number

      // Para API routes, solo verificar autenticación y agregar headers (como request headers)
      if (isApiRoute) {
        console.log('🔍 Middleware ejecutándose para API route:', path, { userId, userRole, dealerId: payload.dealerId })
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('x-user-id', userId.toString())
        requestHeaders.set('x-user-role', userRole)

        // Agregar dealerId si está disponible en el payload
        if (payload.dealerId) {
          requestHeaders.set('x-user-dealer-id', payload.dealerId.toString())
        }

        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
        return response
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

      // Agregar headers con información del usuario para las páginas (como request headers)
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-id', userId.toString())
      requestHeaders.set('x-user-role', userRole)

      if (payload.dealerId) {
        requestHeaders.set('x-user-dealer-id', payload.dealerId.toString())
      }

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
      return response

    } catch (error) {
      // Token inválido
      console.error('Invalid token:', error)
      
      // Para API routes, devolver 401 en lugar de redirigir
      if (isApiRoute) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
      
      // Para páginas, eliminar cookie y redirigir
      const response = NextResponse.redirect(new URL('/', req.url))
      response.cookies.delete('access_token')
      return response
    }
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
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
    '/api/:path*'
  ],
}
