"use server";

import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

/**
 * Called directly from the client after Flutterwave onSuccess fires.
 * This is the PRIMARY credit path — the webhook is a secondary safety net.
 * 
 * Idempotent: if the reference was already processed (by a previous call or
 * the webhook), it returns success without double-crediting.
 */
export async function confirmDeposit({
    tx_ref,
    amount,
    payer_id,
}: {
    tx_ref: string;
    amount: number;
    payer_id: string;
}) {
    if (!tx_ref || !payer_id || !amount || amount <= 0) {
        return { error: 'Invalid deposit parameters' };
    }

    const db = getAdminClient();

    // --- IDEMPOTENCY CHECK ---
    // If deposit already exists with status 'Completed', skip (webhook or previous call already handled it)
    const { data: existing } = await db
        .from('deposits')
        .select('id, status')
        .eq('reference', tx_ref)
        .maybeSingle();

    if (existing && existing.status === 'Completed') {
        return { success: true, message: 'Already processed' };
    }

    try {
        // Verify the transaction with Flutterwave using tx_ref search
        // (prevents replay attacks / crediting fake payments)
        const verifyRes = await fetch(
            `https://api.flutterwave.com/v3/transactions?tx_ref=${encodeURIComponent(tx_ref)}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const verifyData = await verifyRes.json();
        const txData = verifyData?.data?.[0];

        if (
            !txData ||
            verifyData.status !== 'success' ||
            txData.status !== 'successful' ||
            txData.tx_ref !== tx_ref ||
            txData.currency !== 'NGN'
        ) {
            return { error: 'Payment verification failed. Please contact support if funds were deducted.' };
        }

        // Use the settled amount from Flutterwave (after their fees)
        const settledAmount = txData.amount_settled
            ? Number(txData.amount_settled)
            : (Number(txData.amount) - Number(txData.app_fee || 0));

        // --- INSERT OR UPDATE DEPOSIT RECORD ---
        if (existing) {
            // Record exists but was 'Refunded' or another state — update it
            await db
                .from('deposits')
                .update({ status: 'Completed', amount: settledAmount })
                .eq('reference', tx_ref);
        } else {
            const { error: insertErr } = await db
                .from('deposits')
                .insert({
                    user_id: payer_id,
                    amount: settledAmount,
                    status: 'Completed',
                    reference: tx_ref,
                });
            if (insertErr) throw insertErr;
        }

        // --- CREDIT WALLET (atomic RPC) ---
        const { error: rpcErr } = await db.rpc('increment_wallet_balance', {
            user_id_param: payer_id,
            amount_param: settledAmount,
        });

        if (rpcErr) {
            // Fallback read-modify-write
            const { data: profile } = await db
                .from('profiles')
                .select('wallet_balance')
                .eq('id', payer_id)
                .single();
            const newBalance = Number(profile?.wallet_balance || 0) + settledAmount;
            await db
                .from('profiles')
                .update({ wallet_balance: newBalance })
                .eq('id', payer_id);
        }

        // --- IN-APP NOTIFICATION ---
        await createNotification(
            payer_id,
            'Deposit Successful',
            `Your wallet has been funded with ₦${settledAmount.toLocaleString()}.`,
            '/dashboard/student?tab=wallet',
            'deposit'
        );

        // Fetch new balance to return to client
        const { data: updated } = await db
            .from('profiles')
            .select('wallet_balance')
            .eq('id', payer_id)
            .single();

        return {
            success: true,
            newBalance: Number(updated?.wallet_balance || 0),
            settledAmount,
        };
    } catch (err: any) {
        console.error('[confirmDeposit] Error:', err);
        return { error: err.message || 'Failed to confirm deposit' };
    }
}
