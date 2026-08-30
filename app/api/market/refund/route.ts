export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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
            return NextResponse.json({ error: "Unauthorized to refund this transaction." }, { status: 403 });
        }

        if (tx.status !== 'pending') {
            return NextResponse.json({ error: "Transaction is not pending." }, { status: 400 });
        }

        // 3. Initialize Admin Client to bypass RLS for critical financial/inventory updates
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 4. Update the transaction status to 'refunded'
        const { error: updateError } = await supabaseAdmin
            .from('escrow_transactions')
            .update({ status: 'refunded' })
            .eq('id', tx.id);

        if (updateError) throw updateError;

        // 5. Refund the buyer's wallet (increment_wallet_balance RPC)
        const { error: refundError } = await supabaseAdmin.rpc('increment_wallet_balance', {
            payee_id_param: tx.payer_id,
            amount_param: tx.amount
        });

        if (refundError) throw refundError;

        // 6. Restock the inventory
        if (tx.listing_id) {
            // Fetch current state to perform smart status restoration
            const { data: currentListing, error: fetchError } = await supabaseAdmin
                .from('market_listings')
                .select('quantity, status')
                .eq('id', tx.listing_id)
                .single();
                
            if (fetchError) throw fetchError;
            
            const newStatus = currentListing.status === 'deleted' ? 'deleted' : 'active';
            
            const { error: restockError } = await supabaseAdmin
                .from('market_listings')
                .update({ 
                    quantity: currentListing.quantity + 1,
                    status: newStatus 
                })
                .eq('id', tx.listing_id);

            if (restockError) throw restockError;
        }

        // 7. Fire System Notifications
        // Notify Seller
        const { error: sellerNotifError } = await supabaseAdmin.from('notifications').insert({
            user_id: tx.payee_id,
            title: 'Order Cancelled & Refunded',
            message: 'The buyer cancelled the transaction. Your item has been restocked and the funds were refunded.',
            type: 'system',
            is_read: false
        });
        if (sellerNotifError) console.error('Notification Error:', sellerNotifError);

        // Notify Buyer
        const { error: buyerNotifError } = await supabaseAdmin.from('notifications').insert({
            user_id: tx.payer_id,
            title: 'Refund Issued',
            message: `Your transaction for ₦${tx.amount.toLocaleString()} has been successfully refunded to your wallet.`,
            type: 'system',
            is_read: false
        });
        if (buyerNotifError) console.error('Notification Error:', buyerNotifError);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Refund API error:', error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
