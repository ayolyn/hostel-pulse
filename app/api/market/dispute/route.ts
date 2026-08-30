export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const { transaction_id } = await req.json();
        const supabase = await createClient();

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Get the session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the transaction and validate
        const { data: transaction, error: txError } = await supabase
            .from('escrow_transactions')
            .select('*')
            .eq('id', transaction_id)
            .single();

        if (txError || !transaction) {
            return NextResponse.json({ error: "Transaction not found." }, { status: 400 });
        }

        if (transaction.payer_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized. Only the buyer can dispute this transaction." }, { status: 403 });
        }

        if (transaction.status !== 'pending' && transaction.status !== 'HELD' && transaction.status !== 'Locked') {
            return NextResponse.json({ error: `Cannot dispute a transaction that is ${transaction.status}.` }, { status: 400 });
        }

        const now = new Date();
        const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // 3. Update status to Disputed and SLA timers
        const { error: updateError } = await supabaseAdmin
            .from('escrow_transactions')
            .update({ 
                status: 'Disputed',
                dispute_opened_at: now.toISOString(),
                dispute_deadline: deadline.toISOString()
            })
            .eq('id', transaction_id);

        if (updateError) throw updateError;

        // 4. Fire System Notifications
        // Notify Seller
        if (transaction.payee_id) {
            await createNotification(
                transaction.payee_id,
                'Dispute Raised',
                'DISPUTE OPENED: You have 48 hours to respond in the Case Room or funds will be refunded to the buyer.',
                '/dashboard/student/disputes',
                'dispute_opened'
            );
        }

        // Notify Buyer
        await createNotification(
            transaction.payer_id,
            'Dispute Raised',
            'DISPUTE OPENED: A Case Room has been created. Please upload your evidence.',
            '/dashboard/student/disputes',
            'dispute_opened'
        );

        // Notify Admins
        const { data: admins } = await supabaseAdmin
            .from('user_roles')
            .select('user_id')
            .in('role', ['admin', 'super_admin']);

        if (admins && admins.length > 0) {
            for (const admin of admins) {
                await createNotification(
                    admin.user_id,
                    'Dispute Raised',
                    'A buyer has flagged this transaction for review.',
                    `/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/disputes/${transaction_id}`,
                    'dispute_opened'
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Dispute API error:', error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
