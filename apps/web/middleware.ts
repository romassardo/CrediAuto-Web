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

  // Obtener token de las cookies
  const token = req.cookies.get('auth-token')?.value

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
      const userId = payload.userId as string

      // Verificar permisos específicos por ruta
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

      // Agregar headers con información del usuario para las páginas
      const response = NextResponse.next()
      response.headers.set('x-user-id', userId)
      response.headers.set('x-user-role', userRole)
      
      return response

    } catch (error) {
      // Token inválido, eliminar cookie y redirigir
      console.error('Invalid token:', error)
      const response = NextResponse.redirect(new URL('/', req.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}

// Configurar en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, sitemap.xml, robots.txt (archivos de metadata)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
}
