import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Token check via cookie (set on login for SSR middleware compatibility)
  const token = request.cookies.get('access_token')?.value;

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/vendors', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
