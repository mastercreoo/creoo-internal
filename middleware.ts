import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PUBLIC ROUTES - no auth required
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ALL OTHER ROUTES - require authentication
  const sessionCookie = request.cookies.get('auth_session')?.value;

  // NO COOKIE = NO ACCESS
  if (!sessionCookie) {
    console.log(`[MIDDLEWARE] No session - blocking ${pathname}, redirecting to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // TRY TO PARSE SESSION
  try {
    const session = JSON.parse(sessionCookie);

    // MUST HAVE userId AND role
    if (!session.userId || !session.role) {
      console.log(`[MIDDLEWARE] Invalid session data - blocking ${pathname}`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log(`[MIDDLEWARE] Valid session - allowing ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error(`[MIDDLEWARE] Corrupt cookie - blocking ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// PROTECT EVERYTHING EXCEPT PUBLIC ROUTES
export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - /login
     * - /api/auth/login
     * - /api/auth/logout
     * - /_next
     * - /favicon.ico
     * - /public files
     */
    '/((?!login|api/auth|_next|favicon.ico|public).*)',
  ],
};
