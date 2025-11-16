import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar la sesión para asegurar que las cookies estén actualizadas
  await supabase.auth.getSession()

  // Usar getSession() en lugar de getUser() como solicitaste
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Rutas de autenticación
  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')
  
  // Rutas protegidas (solo estas necesitan autenticación)
  // Marketplace es público para ver, pero requiere auth para subir/comprar
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/strategy') ||
    pathname.startsWith('/trades') ||
    pathname.startsWith('/analysis')
  
  // Marketplace: permitir acceso público para ver, pero proteger acciones
  const isMarketplaceAction = 
    pathname.startsWith('/marketplace') && (
      pathname.includes('/upload') ||
      pathname.match(/\/marketplace\/[^/]+\/(purchase|edit|delete)/)
    )

  // Si no hay sesión y el usuario intenta acceder a una ruta protegida
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Marketplace actions require authentication
  if (!session && isMarketplaceAction) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Si hay sesión y el usuario intenta ir a las páginas de auth, redirigir al dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Permitir acceso a todas las demás rutas (incluyendo /auth si no es login/register)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

