import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the user session cookie
  const userSession = request.cookies.get('user_session');
  const path = request.nextUrl.pathname;
  
  // Routes that require authentication
  const protectedRoutes = ['/admin', '/my-bookings', '/profile'];
  
  // Check if the requested path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
    // If the route is protected and no session exists, redirect to login
  if (isProtectedRoute && !userSession) {
    const redirectUrl = new URL('/login', request.url);
    // Preserve the original URL for redirection after login
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/my-bookings',
    '/profile',
  ]
};