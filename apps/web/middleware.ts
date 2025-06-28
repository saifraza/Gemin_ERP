import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // List of public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/logout',
    '/force-logout',
    '/setup',
  ];
  
  // Static assets don't need auth
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') ||
      pathname === '/favicon.ico' ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js')) {
    return NextResponse.next();
  }
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For all other routes, strictly check for auth token
  const token = request.cookies.get('auth_token')?.value;
  
  // No token = no access
  if (!token) {
    console.log(`Middleware: No auth token for ${pathname}, redirecting to login`);
    
    // Clear any stale auth cookies
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('auth-storage');
    response.cookies.delete('auth_token');
    
    return response;
  }
  
  // TODO: Optionally verify token validity here
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};