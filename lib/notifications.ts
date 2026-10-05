"use server";

import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS for system notifications
export async function createNotification(userId: string, title: string, message: string, link: string = '#', type: string = 'system') {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false } }
        );

        // 1. Insert into notifications table
        const { error } = await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            title,
            message: message || '',
            body: message || title || '', // Satisfy NOT NULL constraint
            link,
            type: type || 'system',
            is_read: false,
        });

        if (error) {
            console.error('Error creating notification:', error);
        }

        // 2. Admin Visibility: Log to Admin 'System Alerts' table
        try {
            await supabaseAdmin.from('system_alerts').insert({
                user_id: userId,
                event_type: type || 'system',
                title,
                message: message || ''
            });
        } catch (alertError) {
            console.warn('Non-critical: could not log to system_alerts:', alertError);
        }

        // 3. Send email for transactional alerts (case-insensitive)
        const emailTriggerTypes = [
            'verification_success',
            'verification_failed',
            'account_approved',
            'account_rejected',
            'account_suspended',
            'account_banned',
            'dispute_resolved',
            'dispute_opened',
            'warning',
            'strike_issued',
            'inspection',
            'inspection_confirmed',
            'inspection_completed',
            'booking',
            'booking_requested',
            'booking_success',
            'payment_success',
            'new_sale',
            'new_purchase',
            'order_cancelled',
            'deposit',
            'withdrawal_queued',
            'withdrawal_approved',
            'payout_processed',
        ];

        const normalizedType = (type || '').toLowerCase();
        if (emailTriggerTypes.includes(normalizedType)) {
            try {
                let userEmail = '';
                const { data: profile } = await supabaseAdmin.from('profiles').select('contact_email').eq('id', userId).maybeSingle();
                if (profile?.contact_email) {
                    userEmail = profile.contact_email;
                } else {
                    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
                    if (authData?.user?.email) {
                        userEmail = authData.user.email;
                    }
                }

                if (userEmail && userEmail.includes('@')) {
                    const { sendNotificationEmail } = await import('@/lib/email/resend');
                    const { getEmailTemplate } = await import('@/app/actions/emailTemplates');

                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hostelpulse.app';
                    const buttonLink = link && link !== '#'
                        ? (link.startsWith('http') ? link : `${appUrl}${link}`)
                        : undefined;

                    const html = getEmailTemplate({
                        subHeading: 'HOSTEL PULSE ALERT',
                        title,
                        body: `<p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">${message}</p>`,
                        buttonText: buttonLink ? 'View on Hostel Pulse' : undefined,
                        buttonLink,
                        showFallbackLink: false
                    });

                    await sendNotificationEmail(userEmail, title, html);
                }
            } catch (emailErr) {
                console.error('[createNotification] Failed to send email alert (non-critical):', emailErr);
            }
        }
    } catch (e) {
        console.error('Failed to create notification or system alert (caught exception):', e);
    }
}
