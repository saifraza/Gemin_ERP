import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // List of public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/setup',
    '/_next',
    '/favicon.ico',
  ];
  
  // API routes have their own authentication
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For all other routes, check for auth token
  // Check localStorage value from the auth store
  const authStorageCookie = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;
  
  if (authStorageCookie) {
    try {
      const authData = JSON.parse(authStorageCookie);
      isAuthenticated = authData?.state?.isAuthenticated || false;
    } catch (e) {
      console.error('Failed to parse auth storage:', e);
    }
  }
  
  // Also check for auth_token cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // If no authentication found, redirect to login
  if (!isAuthenticated && !token) {
    console.log(`Middleware: No auth for ${pathname}, redirecting to login`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};