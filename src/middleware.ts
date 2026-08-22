import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

// Initialize NextAuth with Edge-compatible config
const { auth } = NextAuth(authConfig);

// Simple in-memory rate limiter for MVP (Will be replaced with Redis later)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export default auth((req) => {
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isAuthApi = req.nextUrl.pathname.startsWith('/api/auth');

  // 1. Global API Rate Limiting (100 req/min)
  if (isApiRoute) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 100; // Max 100 requests per minute

    const record = rateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      record.count++;
      if (record.count > maxRequests) {
        return new NextResponse('Too Many Requests - Rate Limit Exceeded', { status: 429 });
      }
    }
  }

  // 2. Route Protection
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up');
  const isProtectedPage =
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/workspace') ||
    req.nextUrl.pathname.startsWith('/settings');

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl));
  }

  if (isProtectedPage && !isLoggedIn) {
    return Response.redirect(new URL('/sign-in', req.nextUrl));
  }

  // 3. API Protection (Block unauthenticated API access, except for NextAuth routes)
  if (isApiRoute && !isAuthApi && !isLoggedIn) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 4. Security Headers
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return res;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
