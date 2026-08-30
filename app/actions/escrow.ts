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
        );
    }

    return { success: true };
}

export async function initiateEscrowDispute(transactionId: string, reason?: string) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

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

    if (user.id !== transaction.payer_id) {
        return { error: 'Only the payer can freeze funds for this transaction' };
    }

    // 2. Update status to 'Disputed' and set dispute details
    const { error: updateErr } = await db
        .from('escrow_transactions')
        .update({ 
            status: 'Disputed',
            dispute_status: 'OPEN',
            dispute_reason: reason || 'No reason provided'
        })
        .eq('id', transactionId);

    if (updateErr) {
        return { error: updateErr.message };
    }

    // 3. Send Notification to Seller (and maybe buyer)
    await createNotification(
        transaction.payee_id,
        'Dispute Opened',
        'A dispute has been opened for a recent transaction. Funds are frozen until resolved.',
        `/dashboard/student/disputes/${transactionId}`,
        'dispute_opened'
    );
    
    await createNotification(
        transaction.payer_id,
        'Dispute Opened',
        'Your dispute has been logged and is under review by our Admin team.',
        `/dashboard/student/disputes/${transactionId}`,
        'dispute_opened'
    );

    return { success: true };
}

export async function cancelAndRefundOrder(transactionId: string) {
    const db = getAdminClient();

    // 1. Fetch transaction
    const { data: transaction, error: fetchErr } = await db
        .from('escrow_transactions')
        .select('*, properties(title), market_listings(title)')
        .eq('id', transactionId)
        .single();
        
    if (fetchErr || !transaction) {
        return { error: 'Transaction not found' };
    }

    if (transaction.status === 'Refunded' || transaction.status === 'completed') {
        return { error: 'Transaction cannot be cancelled' };
    }

    // 2. Update status to 'Refunded'
    const { error: updateErr } = await db
        .from('escrow_transactions')
        .update({ status: 'Refunded' })
        .eq('id', transactionId);

    if (updateErr) {
        return { error: updateErr.message };
    }

    // 3. Update Buyer's wallet balance
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

    // 4. Send Notification to Buyer
    const itemTitle = transaction.properties?.title || transaction.market_listings?.title || 'an item';
    
    await createNotification(
        transaction.payer_id,
        'Order Cancelled',
        `Your order for ${itemTitle} was cancelled by the seller and funds have been refunded.`,
        '/dashboard/student?tab=wallet',
        'system_alert'
    );

    return { success: true };
}

export async function resolveEscrowDispute(transactionId: string, resolution: 'REFUND_BUYER' | 'RELEASE_SELLER') {
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

    if (transaction.dispute_status !== 'OPEN') {
        return { error: 'Transaction does not have an open dispute' };
    }

    if (resolution === 'REFUND_BUYER') {
        // Update status to 'Refunded' and resolve dispute
        const { error: updateErr } = await db
            .from('escrow_transactions')
            .update({ 
                status: 'Refunded',
                dispute_status: 'RESOLVED_REFUNDED'
            })
            .eq('id', transactionId);

        if (updateErr) return { error: updateErr.message };

        // Refund Buyer
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

        await createNotification(
            transaction.payer_id,
            'Dispute Resolved',
            `Your dispute was resolved in your favor. '${Number(transaction.amount).toLocaleString()} has been refunded to your wallet.`,
            '/dashboard/student?tab=wallet',
            'system_alert'
        );
        
        await createNotification(
            transaction.payee_id,
            'Dispute Resolved',
            `A dispute was resolved in the buyer's favor. The funds were refunded.`,
            '/dashboard/student?tab=wallet',
            'system_alert'
        );

    } else if (resolution === 'RELEASE_SELLER') {
        // Update status to 'Released' and resolve dispute
        const { error: updateErr } = await db
            .from('escrow_transactions')
            .update({ 
                status: 'Released',
                dispute_status: 'RESOLVED_RELEASED'
            })
            .eq('id', transactionId);

        if (updateErr) return { error: updateErr.message };

        // Release to Seller
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

        await createNotification(
            transaction.payee_id,
            'Dispute Resolved',
            `A dispute was resolved in your favor. '${Number(transaction.amount).toLocaleString()} has been released to your wallet.`,
            '/dashboard/student?tab=wallet',
            'system_alert'
        );
        
        await createNotification(
            transaction.payer_id,
            'Dispute Resolved',
            `Your dispute was reviewed and resolved in the seller's favor. The funds were released.`,
            '/dashboard/student?tab=wallet',
            'system_alert'
        );
    }

    return { success: true };
}

export async function processCustomOffer(offerId: string, amount: number, sellerId: string, buyerId: string) {
    const db = getAdminClient();

    // 0. Verify offer has not expired
    const { data: msg } = await db.from('messages').select('content').eq('id', offerId).single();
    if (msg && msg.content) {
        const payloadStr = msg.content.replace('[CUSTOM_OFFER_PAYLOAD]:::', '').replace('[OFFER_PAID]:::', '');
        try {
            const payload = JSON.parse(payloadStr);
            if (payload.expiresAt) {
                const expires = new Date(payload.expiresAt).getTime();
                if (Date.now() > expires) {
                    return { error: 'Offer has expired' };
                }
            }
        } catch (e) {}
    }

    // 1. Fetch Buyer's wallet balance
    const { data: buyerProfile, error: fetchErr } = await db
        .from('profiles')
        .select('wallet_balance')
        .eq('id', buyerId)
        .single();
        
    if (fetchErr || !buyerProfile) {
        return { error: 'Buyer profile not found' };
    }

    const currentBalance = Number(buyerProfile.wallet_balance || 0);
    if (currentBalance < amount) {
        return { error: 'Insufficient funds' };
    }

    // 2. Deduct amount from Buyer's wallet
    const { error: updateErr } = await db
        .from('profiles')
        .update({ wallet_balance: currentBalance - amount })
        .eq('id', buyerId);

    if (updateErr) {
        return { error: 'Failed to deduct funds' };
    }

    // 3. Insert into escrow_transactions (omitting property_id and listing_id per instructions)
    const { error: insertErr } = await db
        .from('escrow_transactions')
        .insert({
            payer_id: buyerId,
            payee_id: sellerId,
            amount: amount,
            status: 'Locked',
            type: 'Roommate Offer',
            item_name: 'Custom Roommate Agreement'
        });

    if (insertErr) {
        console.error("Failed to insert into escrow:", insertErr);
        // Best effort rollback
        await db.from('profiles').update({ wallet_balance: currentBalance }).eq('id', buyerId);
        return { error: 'Failed to secure funds in escrow. ' + insertErr.message };
    }

    // 4. Send Notification to Seller
    await createNotification(
        sellerId,
        'Offer Accepted & Paid',
        `A custom offer of ₦${amount.toLocaleString()} has been paid and locked in Escrow.`,
        '/dashboard/student?tab=wallet',
        'new_sale'
    );

    return { success: true };
}
