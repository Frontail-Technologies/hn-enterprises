import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isAuthPage = path === '/login' || path === '/forgot-password' || path.startsWith('/reset-password');
  const isPublicPage = path === '/favicon.ico' || path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/public');

  if (isPublicPage) {
    return NextResponse.next();
  }
  
  const hasToken = request.cookies.has('accessToken') || request.cookies.has('refreshToken');
  
  if (!hasToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)']
}
