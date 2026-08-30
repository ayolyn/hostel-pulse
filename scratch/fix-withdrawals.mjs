import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
    const { data: withdrawals } = await supabaseAdmin
        .from('withdrawals')
        .select('*, profiles(contact_email)')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(3);

    for (const w of withdrawals) {
        console.log('Fixing withdrawal:', w.id, w.amount);
        
        await supabaseAdmin.from('notifications').insert({
            user_id: w.user_id,
            title: 'Withdrawal Successful',
            message: 'Your withdrawal request has been approved and processed.',
            body: 'Your withdrawal request has been approved and processed.',
            link: '/dashboard/agent?tab=wallet',
            type: 'withdrawal',
            is_read: false
        });

        if (w.profiles?.contact_email) {
            const html = `<div style="font-family: sans-serif; padding: 40px;">
                <h2 style="color: #16a34a;">Withdrawal Approved! 💸</h2>
                <p>Your withdrawal request of <strong>₦${Number(w.amount).toLocaleString()}</strong> has been successfully approved by the Admin team.</p>
                <p>The funds are being transferred to your <strong>${w.bank_name}</strong> account ending in <strong>${String(w.account_number).slice(-4)}</strong>.</p>
            </div>`;
            
            await resend.emails.send({
                from: 'Hostel Pulse <info@hostelpulse.app>',
                to: [w.profiles.contact_email],
                subject: 'Withdrawal Approved 💸',
                html: html
            });
            console.log('Email sent to', w.profiles.contact_email);
        }
    }
}
fix();
