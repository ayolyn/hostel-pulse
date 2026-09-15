export const runtime = 'edge';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * /auth/callback — Supabase OAuth and email link callback route.
 * Handles: Google OAuth, magic links, and password recovery.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    // Always redirect to the canonical production domain.
    // The callback may run on hostel-pulse.pages.dev (Cloudflare internal) so
    // we MUST hardcode the real domain here instead of deriving from the request.
    const PRODUCTION_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://hostelpulse.app';
    const origin = PRODUCTION_ORIGIN;
    const code = searchParams.get('code');
    const type = searchParams.get('type'); // 'recovery' for password reset emails

    // Password recovery — redirect to the reset password page
    if (type === 'recovery' && !code) {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch (error) {
                            // Ignored safely in Route Handlers
                        }
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Ensure profile exists for OAuth signups
            const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
            if (!existingProfile) {
                const metadata = data.user.user_metadata || {};
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    full_name: metadata.full_name || metadata.name || 'User',
                    avatar_url: metadata.avatar_url || metadata.picture || null,
                    phone: metadata.phone || null
                });
                
                // Send onboarding system notification
                await supabase.from('notifications').insert({
                    user_id: data.user.id,
                    title: 'Welcome to Hostel Pulse! ',
                    message: 'Hey babe! Welcome to the coolest housing platform in Ogbomoso. Make sure to complete your profile to get started!',
                    type: 'system',
                    is_read: false
                });
                
                // Call email action
                if (data.user.email) {
                    try {
                        const emailRes = await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                from: 'Hostel Pulse <hello@hostel-pulse.com>',
                                to: [data.user.email],
                                subject: 'Welcome to Hostel Pulse! ',
                                html: `<h1>Welcome!</h1><p>Hey babe! Welcome to the coolest housing platform in Ogbomoso. Make sure to complete your profile to get started!</p>`
                            })
                        });
                    } catch(e) {}
                }
            }

            // If this was a password recovery flow, go to the reset page
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/auth/reset-password`);
            }
            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    return NextResponse.redirect(`${origin}/join?error=auth_failed`);
}
