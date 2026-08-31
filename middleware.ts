import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware — runs on every request before rendering.
 * Protects all /dashboard/* routes: unauthenticated users are redirected to /join.
 * Also refreshes expired Supabase sessions automatically.
 */

function applySecurityHeaders(res: NextResponse) {
    res.headers.set('X-DNS-Prefetch-Control', 'on');
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' blob: data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-src 'self' https:;");
    return res;
}

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    // Update the response cookies so the session is persisted
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired — important for Server Components
    let user: any = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e: any) {
        if (e.name === 'AbortError' || e.message?.includes('AbortError')) {
            console.warn('Supabase auth.getUser() AbortError swallowed in middleware.');
        } else {
            console.error('Middleware Supabase Error:', e);
        }
    }

    // Protect all /dashboard/* routes
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

    if (isDashboard && !user) {
        const redirectUrl = new URL('/join', request.url);
        redirectUrl.searchParams.set('next', request.nextUrl.pathname);
        return applySecurityHeaders(NextResponse.redirect(redirectUrl));
    }

    // Protected admin routes
    const isAdmin = request.nextUrl.pathname.startsWith('/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c');
    if (isAdmin) {
        if (!user) {
            return applySecurityHeaders(NextResponse.redirect(new URL('/join', request.url)));
        }
        
        // Lock path so only super_admin can enter
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
            
        if (roleData?.role !== 'super_admin') {
            return applySecurityHeaders(NextResponse.redirect(new URL('/join', request.url))); // or /dashboard
        }
    }


    return applySecurityHeaders(supabaseResponse);

}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public files
         * - auth routes (they handle their own auth)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
