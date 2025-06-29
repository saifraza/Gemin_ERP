import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  
  console.log(`[MIDDLEWARE] Path: ${pathname}, Has Token: ${!!token}, Token Value: ${token ? 'exists' : 'none'}`);
  
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
  
  // Special handling for root path
  if (pathname === '/') {
    if (!token) {
      console.log('[MIDDLEWARE] Root path accessed without auth, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // If authenticated, redirect to dashboard
    console.log('[MIDDLEWARE] Root path accessed with auth, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For all other routes, strictly check for auth token
  // We already have the token from above
  
  // No token = no access
  if (!token) {
    console.log(`[MIDDLEWARE] BLOCKING ACCESS: ${pathname} - No auth token, redirecting to login`);
    
    // Store the original URL to redirect back after login
    const loginUrl = new URL('/auth/login', request.url);
    
    // Add the redirect URL as a query parameter
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    
    // Clear any stale auth cookies
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-storage');
    response.cookies.delete('auth_token');
    
    console.log(`[MIDDLEWARE] Redirecting to: ${loginUrl.toString()}`);
    return response;
  }
  
  // List of protected routes that MUST have authentication
  const protectedRoutes = [
    '/dashboard',
    '/master-data',
    '/finance',
    '/company',
    '/system-test',
  ];
  
  // Double-check protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !token) {
    console.log(`[MIDDLEWARE] CRITICAL: Protected route ${pathname} accessed without token!`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  console.log(`[MIDDLEWARE] Allowing access to ${pathname} with token`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};