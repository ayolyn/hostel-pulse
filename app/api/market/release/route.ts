export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const { transaction_id } = await req.json();
        const supabase = await createClient();

        // 1. Get the session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the transaction
        const { data: tx, error: txError } = await supabase
            .from('escrow_transactions')
            .select('*')
            .eq('id', transaction_id)
            .single();

        if (txError || !tx) {
            return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
        }

        if (tx.payer_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized to release this transaction." }, { status: 403 });
        }

        if (tx.status !== 'pending') {
            return NextResponse.json({ error: "Transaction is not pending." }, { status: 400 });
        }

        // 3. Initialize Admin Client to bypass RLS for critical financial updates
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 4. Atomically update status to 'completed' — prevents double-release race condition
        // The .eq('status', 'pending') ensures only one concurrent request can succeed
        const { data: updatedTx, error: updateError } = await supabaseAdmin
            .from('escrow_transactions')
            .update({ status: 'completed' })
            .eq('id', tx.id)
            .eq('status', 'pending')
            .select()
            .single();

        if (updateError || !updatedTx) {
            return NextResponse.json({ error: "Transaction is no longer pending or already completed." }, { status: 400 });
        }



        // 5. Increment the payee's wallet balance
        const { error: fundError } = await supabaseAdmin.rpc('increment_wallet_balance', {
            payee_id_param: tx.payee_id,
            amount_param: tx.amount
        });

        if (fundError) throw fundError;

        // Insert notification for the seller
        await createNotification(
            tx.payee_id,
            'Funds Released!',
            'The buyer confirmed delivery. The funds have been added to your Available Balance.',
            '/dashboard/student?tab=wallet',
            'sale_completed'
        );

        // Also update the market listing status to sold
        if (tx.listing_id) {
            const { error: listingError } = await supabaseAdmin
                .from('market_listings')
                .update({ status: 'sold' })
                .eq('id', tx.listing_id);
            if (listingError) {
                console.error('Failed to update listing status to sold:', listingError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Release API error:', error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
