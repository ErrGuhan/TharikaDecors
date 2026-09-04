import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  // Fast-path: Public pages NEVER execute Supabase auth network calls in Edge Middleware
  if (!isAdminRoute && !isLoginRoute) {
    return NextResponse.next();
  }

  // Fast-path cookie check: If there are no Supabase auth cookies, resolve immediately without network calls
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) =>
      c.name.startsWith('sb-') ||
      c.name.includes('auth-token') ||
      c.name.includes('supabase')
  );

  // Unauthenticated user trying to access /admin -> redirect to /login immediately (0ms network delay)
  if (isAdminRoute && !hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Visitor accessing /login without auth cookies -> render /login immediately (0ms network delay)
  if (isLoginRoute && !hasAuthCookie) {
    return NextResponse.next();
  }

  // If auth cookies exist, safely initialize Supabase client and validate session with a timeout guard
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://msrhvfkdptfghslfxoqv.supabase.co';

  const supabaseKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'sb_publishable_dLW4P7RhNKJUOJvjMVvxfw_57quyFBH';

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  let user = null;
  try {
    // Enforce a strict 2.5s timeout to guarantee Vercel Edge Middleware never times out with a 504
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 2500)
    );

    const result = await Promise.race([authPromise, timeoutPromise]);
    user = result?.data?.user || null;
  } catch (err) {
    console.warn('[Middleware Auth Fallback]:', err);
    user = null;
  }

  // Protect /admin routes — redirect unauthenticated or timed-out users to /login
  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from /login straight to /admin
  if (isLoginRoute) {
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * ONLY match /admin and /login routes.
     * All public pages (/, /about, /weddings, /baby-showers, /portfolio, /book)
     * completely bypass Edge Middleware, ensuring zero latency and zero 504 timeouts.
     */
    '/admin/:path*',
    '/login',
  ],
};
