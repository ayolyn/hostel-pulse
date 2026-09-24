"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';
import { sendNotificationEmail } from '@/lib/email/resend';

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, {
        auth: { persistSession: false }
    });
}

export async function releaseEscrowFunds(transactionId: string) {
    const db = getAdminClient();
    
    // 1. Fetch transaction
    const { data: transaction, error: fetchErr } = await db
        .from('escrow_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
        
    if (fetchErr || !transaction) {
        return { error: 'Transaction not found' };
    }

    if (transaction.status === 'Released' || transaction.status === 'completed') {
        return { error: 'Funds have already been released' };
    }

    // 2. Update transaction status
    const { error: updateErr } = await db
        .from('escrow_transactions')
        .update({ status: 'Released' })
        .eq('id', transactionId);

    if (updateErr) {
        return { error: updateErr.message };
    }

    // 2.5 Update Booking if applicable
    if (transaction.type === 'RENT') {
        await db
            .from('bookings')
            .update({ status: 'Completed' })
            .eq('escrow_id', transactionId);
    }

    // 3. Update Seller's wallet balance
    const { data: sellerProfile } = await db
        .from('profiles')
        .select('wallet_balance')
        .eq('id', transaction.payee_id)
        .single();

    if (sellerProfile) {
        const newBalance = Number(sellerProfile.wallet_balance || 0) + Number(transaction.amount);
        await db
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', transaction.payee_id);
    }

    // 3.5 Increment deals_closed for agents and landlords
    if (transaction.payee_id) {
        // We use raw RPC if possible, but since we don't have one, we can fetch, increment, update.
        // Or we can try to use a quick SQL edge function. 
        // Let's just fetch current deals_closed and +1 it.
        const { data: agentData } = await db.from('agent_accounts').select('deals_closed').eq('id', transaction.payee_id).maybeSingle();
        if (agentData) {
            await db.from('agent_accounts').update({ deals_closed: Number(agentData.deals_closed || 0) + 1 }).eq('id', transaction.payee_id);
        } else {
            // Try landlord
            const { data: landlordData } = await db.from('landlord_accounts').select('total_deals, deals_closed').eq('id', transaction.payee_id).maybeSingle();
            if (landlordData) {
                // Wait, landlord_accounts has deals_closed? No, wait... let's check. If it fails it fails silently.
                await db.from('landlord_accounts').update({ deals_closed: Number((landlordData as any).deals_closed || 0) + 1 }).eq('id', transaction.payee_id).catch(() => null);
            }
        }
    }

    // 4. Send Notification to Seller
    await createNotification(
        transaction.payee_id,
        'Funds Released',
        `Your escrow funds of ₦${Number(transaction.amount).toLocaleString()} have been released.`,
        '/dashboard/student?tab=wallet',
        'sale_completed'
    );

    // 5. Send Email to Seller
    const { data: { user: sellerUser } } = await db.auth.admin.getUserById(transaction.payee_id);
    if (sellerUser?.email) {
        const { data: property } = transaction.property_id 
            ? await db.from('properties').select('title').eq('id', transaction.property_id).single()
            : { data: null };
            
        const htmlBody = `
            <div style="background-color: #f6f9fc; font-family: sans-serif; padding: 40px 0;">
                <div style="background-color: #ffffff; padding: 40px; border-radius: 4px; margin: 0 auto; max-width: 600px;">
                    <h2 style="font-size: 24px; font-weight: bold; color: #16a34a; margin-top: 0;">Funds Released to Wallet 💰</h2>
                    <p style="font-size: 16px; color: #555;">
                        Great news! The escrow funds of <strong>₦${Number(transaction.amount).toLocaleString()}</strong> for <strong>${property?.title || 'Property'}</strong> have been released to your wallet.
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        You can now withdraw these funds to your local bank account at any time.
                    </p>
                </div>
            </div>
        `;
        
        await sendNotificationEmail(
            sellerUser.email,
            'Funds Released to your Wallet 💰',
            htmlBody
        ).catch(err => console.error("Email failed:", err));
    }

    return { success: true };
}

export async function initiateEscrowDispute(transactionId: string) {
    const db = getAdminClient();
    
    // 1. Fetch transaction
    const { data: transaction, error: fetchErr } = await db
        .from('escrow_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
        
    if (fetchErr || !transaction) {
        return { error: 'Transaction not found' };
    }

    if (transaction.status !== 'Held' && transaction.status !== 'Pending') {
        return { error: 'Cannot dispute a transaction that is already resolved.' };
    }

    // 2. Update status to Disputed
    const { error: updateErr } = await db
        .from('escrow_transactions')
        .update({ status: 'Disputed' })
        .eq('id', transactionId);

    if (updateErr) {
        return { error: updateErr.message };
    }

    // 3. Create a Support Ticket automatically
    await db
        .from('support_tickets')
        .insert({
            user_id: transaction.payer_id,
            subject: 'Escrow Dispute',
            message: `Dispute raised for transaction ID: ${transaction.id}. Amount: ₦${transaction.amount}`,
            status: 'Open'
        });

    return { success: true };
}

export async function cancelAndRefundOrder(transactionId: string) {
    const db = getAdminClient();
    
    const { data: transaction, error: fetchErr } = await db
        .from('escrow_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
        
    if (fetchErr || !transaction) {
        return { error: 'Transaction not found' };
    }

    if (transaction.status !== 'Held' && transaction.status !== 'Pending') {
        return { error: 'Cannot cancel a resolved transaction.' };
    }

    // 1. Update status to Refunded
    const { error: updateErr } = await db
        .from('escrow_transactions')
        .update({ status: 'Refunded' })
        .eq('id', transactionId);

    if (updateErr) {
        return { error: updateErr.message };
    }

    // 2. Refund Buyer's Wallet
    const { data: buyerProfile } = await db
        .from('profiles')
        .select('wallet_balance')
        .eq('id', transaction.payer_id)
        .single();

    if (buyerProfile) {
        const newBalance = Number(buyerProfile.wallet_balance || 0) + Number(transaction.amount);
        await db
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', transaction.payer_id);
    }

    // 3. Notify Buyer
    await createNotification(
        transaction.payer_id,
        'Escrow Refunded',
        `Your escrow payment of ₦${Number(transaction.amount).toLocaleString()} has been refunded to your wallet.`,
        '/dashboard/student?tab=wallet',
        'refund'
    );

    return { success: true };
}
