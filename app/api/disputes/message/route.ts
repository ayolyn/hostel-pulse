export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { escrowId, message } = await req.json();
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

        // 2. Fetch transaction details
        const { data: transaction, error: txError } = await supabaseAdmin
            .from('escrow_transactions')
            .select('*')
            .eq('id', escrowId)
            .single();

        if (txError || !transaction) {
            return NextResponse.json({ error: "Transaction not found." }, { status: 400 });
        }

        // 3. Check role to determine if admin
        const { data: roleData } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
        
        const isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin';
        const isBuyer = transaction.payer_id === user.id;
        const isSeller = transaction.payee_id === user.id;

        if (!isAdmin && !isBuyer && !isSeller) {
            return NextResponse.json({ error: "Unauthorized to access this dispute." }, { status: 403 });
        }

        // 4. Insert message
        const { error: msgError } = await supabaseAdmin
            .from('dispute_messages')
            .insert({
                escrow_id: escrowId,
                sender_id: user.id,
                message: message,
                is_admin: isAdmin
            });

        if (msgError) {
            console.error('INSERT ERROR:', msgError);
            return NextResponse.json({ error: msgError.message }, { status: 500 });
        }

        // 5. Notifications
        const notifies: any[] = [];

        if (isAdmin) {
            notifies.push({
                user_id: transaction.payer_id,
                title: 'Case Room Update',
                message: 'Admin replied to your dispute',
                type: 'dispute',
                is_read: false
            });
            if (transaction.payee_id) {
                notifies.push({
                    user_id: transaction.payee_id,
                    title: 'Case Room Update',
                    message: 'Admin replied to your dispute',
                    type: 'dispute',
                    is_read: false
                });
            }
        } else if (isBuyer) {
            if (transaction.payee_id) {
                notifies.push({
                    user_id: transaction.payee_id,
                    title: 'Case Room Update',
                    message: 'New evidence uploaded by Buyer',
                    type: 'dispute',
                    is_read: false
                });
            }
            // Admin notifs
            const { data: admins } = await supabaseAdmin.from('user_roles').select('user_id').in('role', ['admin', 'super_admin']);
            if (admins) {
                admins.forEach((admin: any) => notifies.push({
                    user_id: admin.user_id,
                    title: 'Case Room Update',
                    message: 'New evidence uploaded by Buyer',
                    type: 'dispute',
                    is_read: false
                }));
            }
        } else if (isSeller) {
            notifies.push({
                user_id: transaction.payer_id,
                title: 'Case Room Update',
                message: 'New evidence uploaded by Seller',
                type: 'dispute',
                is_read: false
            });
            // Admin notifs
            const { data: admins } = await supabaseAdmin.from('user_roles').select('user_id').in('role', ['admin', 'super_admin']);
            if (admins) {
                admins.forEach((admin: any) => notifies.push({
                    user_id: admin.user_id,
                    title: 'Case Room Update',
                    message: 'New evidence uploaded by Seller',
                    type: 'dispute',
                    is_read: false
                }));
            }
        }

        if (notifies.length > 0) {
            const { error: notifError } = await supabaseAdmin.from('notifications').insert(notifies);
            if (notifError) console.error('Message notification error:', notifError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Dispute Message API error:', error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
