import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTHORIZED_ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  'admin@tharikadecor.com,owner@tharikadecor.com,tharika.decor@gmail.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase());

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // 1. Check userEmail from cookie / searchParam / header / session
    const userEmail =
      searchParams.get('userEmail')?.toLowerCase() ||
      request.cookies.get('user_email')?.value?.toLowerCase();

    // If query parameter specifies unauthorized email explicitly, redirect to home
    if (userEmail && !AUTHORIZED_ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
