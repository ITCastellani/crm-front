// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Si el usuario intenta ir al dashboard sin token, lo mandamos al login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si el usuario ya tiene token e intenta ir al login, lo mandamos al dashboard
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Opcional: Configura en qué rutas debe actuar el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
}