import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // List of public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/api',
    '/_next',
    '/favicon.ico',
    '/',
    '/test'
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For all other routes, check for auth token
  const token = request.cookies.get('auth_token')?.value;
  const authStorage = request.cookies.get('auth-storage')?.value;
  
  // Check both cookie and localStorage (via cookie)
  if (!token && !authStorage) {
    // Redirect to login if no authentication
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};