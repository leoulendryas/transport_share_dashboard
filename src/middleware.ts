// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/admin/login', '/api/'];
const JWT_SECRET   = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Read token from cookie
  const token = request.cookies.get('gara_access')?.value;

  if (!token) {
    // Redirect to login if no token
    if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.warn('Middleware: JWT_SECRET missing in environment');
      return NextResponse.next(); // Fallback if secret is missing to avoid lockout in dev
    }
    
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.isAdmin) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('gara_access');
      return response;
    }
    return NextResponse.next();
  } catch (error) {
    // Expired or tampered — clear and redirect
    console.error('Middleware JWT Error:', error);
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('gara_access');
    return response;
  }
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/users/:path*',
    '/admin/rides/:path*',
    '/admin/settings/:path*',
    '/admin/verifications/:path*',
    '/admin/payments/:path*',
    '/admin/reports/:path*',
    '/admin/sos/:path*',
    '/admin/companies/:path*',
    '/admin/reviews/:path*',
    '/admin/messages/:path*',
    '/admin/config/:path*',
  ],
};
