import { NextResponse } from 'next/server';

export function middleware(req) {
  const isLoggedIn = req.cookies.has('nightmare_session');
  const isLoginPage = req.nextUrl.pathname.startsWith('/login');

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

// Only guard the pages, not the API routes or static assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
