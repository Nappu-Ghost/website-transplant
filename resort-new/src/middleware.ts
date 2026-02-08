import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the user session cookie
  const userSession = request.cookies.get('user_session');
  const path = request.nextUrl.pathname;
  
  // Routes that require authentication
  const protectedRoutes = ['/admin', '/book-appointment'];
  
  // Admin routes that require admin/manager roles
  const adminRoutes = ['/admin'];
  
  // Check if the requested path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route));
    // If the route is protected and no session exists, redirect to login
  if (isProtectedRoute && !userSession) {
    const redirectUrl = new URL('/login', request.url);
    // Preserve the original URL for redirection after login
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  // If the route is for admins AND it's not the booking page, check role
  if (isAdminRoute && userSession && !path.startsWith('/book-appointment')) {
    try {
      const userData = JSON.parse(userSession.value);
        // Allow ADMINISTRATIVE_OFFICER to access specific pages
      if (userData.role === 'ADMINISTRATIVE_OFFICER') {        // List of paths that ADMINISTRATIVE_OFFICER can access
        const allowedPaths = [
          '/admin/dashboard',
          '/admin/appointments',
          '/admin/roster/surgery-rooms'  // Only allow access to surgery rooms
        ];
        
        // Check if the current path starts with any of the allowed paths
        // or if it's specifically the surgery-rooms page
        if (allowedPaths.some(allowedPath => path.startsWith(allowedPath)) || 
            path.includes('/surgery-rooms')) {
          return NextResponse.next();
        }
      }
        // For other admin routes, require proper role based on the path
      if (path.startsWith('/admin/roster')) {
        // For roster pages, allow ADMIN and MANAGER roles
        if (userData.role !== 'ADMIN' && userData.role !== 'MANAGER') {
          const url = new URL('/', request.url);
          return NextResponse.redirect(url);
        }
      } else if (userData.role !== 'ADMIN' && userData.role !== 'MANAGER') {
        // For other admin routes, require ADMIN or MANAGER role
        const url = new URL('/', request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If there's an error parsing the cookie, redirect to login
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/book-appointment/:path*',
  ]
};