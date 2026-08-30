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

        const { error } = await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            title,
            message,
            body: message, // Satisfy NOT NULL constraint
            link,
            type,
            is_read: false,
        });

        if (error) {
            console.error('Error creating notification:', error);
        }

        // 3. Admin Visibility: Log to Admin 'System Alerts' table
        const { error: alertError } = await supabaseAdmin.from('system_alerts').insert({
            user_id: userId,
            event_type: type,
            title,
            message
        });

        if (alertError) {
            console.error('Error logging to system_alerts:', alertError);
        }

        // 4. Send generic email for critical system alerts (but NOT for ones that have custom templates like withdrawal or escrow)
        const emailTriggerTypes = [
            'VERIFICATION_SUCCESS', 'account_approved', 
            'VERIFICATION_FAILED', 'account_rejected', 
            'dispute_resolved', 'warning', 'account_suspended', 
            'account_banned'
        ];

        if (emailTriggerTypes.includes(type)) {
            const { data: profile } = await supabaseAdmin.from('profiles').select('contact_email').eq('id', userId).single();
            if (profile?.contact_email) {
                const { sendNotificationEmail } = await import('@/lib/email/resend');
                const { render } = await import('@react-email/render');
                const { SystemAlertEmail } = await import('@/components/emails/SystemAlertEmail');
                
                const html = await render(SystemAlertEmail({ title, message, link }));
                await sendNotificationEmail(profile.contact_email, title, html);
            }
        }
    } catch (e) {
        console.error('Failed to create notification or system alert (caught exception):', e);
    }
}
