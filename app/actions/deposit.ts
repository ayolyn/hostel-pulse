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
 * This is the PRIMARY credit path — the webhook acts as a secondary safety net.
 * 
 * Idempotent: if the reference was already processed (by a previous call or
 * the webhook), it returns success without double-crediting.
 */
export async function confirmDeposit({
    tx_ref,
    amount,
    payer_id,
    flw_id,
}: {
    tx_ref: string;
    amount: number;
    payer_id: string;
    flw_id?: number | string;
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
        const { data: profile } = await db
            .from('profiles')
            .select('wallet_balance')
            .eq('id', payer_id)
            .single();

        return { 
            success: true, 
            message: 'Already processed', 
            newBalance: Number(profile?.wallet_balance || 0) 
        };
    }

    try {
        let verifyData: any = null;

        // 1. Try verify by Flutterwave transaction ID if present
        if (flw_id && Number(flw_id) > 0) {
            try {
                const res = await fetch(
                    `https://api.flutterwave.com/v3/transactions/${flw_id}/verify`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (res.ok) {
                    verifyData = await res.json();
                }
            } catch (err) {
                console.warn('[confirmDeposit] Verify by ID failed, trying reference:', err);
            }
        }

        // 2. Try verify by reference if not yet verified
        if (!verifyData || verifyData.status !== 'success') {
            try {
                const res = await fetch(
                    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(tx_ref)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (res.ok) {
                    verifyData = await res.json();
                }
            } catch (err) {
                console.warn('[confirmDeposit] Verify by reference failed, trying list:', err);
            }
        }

        // 3. Fallback to transactions query endpoint
        if (!verifyData || verifyData.status !== 'success') {
            try {
                const res = await fetch(
                    `https://api.flutterwave.com/v3/transactions?tx_ref=${encodeURIComponent(tx_ref)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (res.ok) {
                    verifyData = await res.json();
                }
            } catch (err) {
                console.warn('[confirmDeposit] Transactions search failed:', err);
            }
        }

        // Extract transaction record safely (handles both object and array response)
        const txData = Array.isArray(verifyData?.data) ? verifyData.data[0] : verifyData?.data;

        if (
            !txData ||
            verifyData?.status !== 'success' ||
            (txData.status !== 'successful' && txData.status !== 'completed') ||
            (txData.tx_ref && txData.tx_ref !== tx_ref)
        ) {
            return { error: 'Payment verification failed with payment gateway. Please contact support.' };
        }

        // Credit the nominal amount deposited (e.g. ₦300 or ₦10,000)
        const creditAmount = Number(txData.amount || amount);

        // --- INSERT OR UPDATE DEPOSIT RECORD ---
        if (existing) {
            await db
                .from('deposits')
                .update({ status: 'Completed', amount: creditAmount })
                .eq('reference', tx_ref);
        } else {
            const { error: insertErr } = await db
                .from('deposits')
                .insert({
                    user_id: payer_id,
                    amount: creditAmount,
                    status: 'Completed',
                    reference: tx_ref,
                });
            if (insertErr) throw insertErr;
        }

        // --- AUDIT TRAIL in wallet_transactions ---
        try {
            await db.from('wallet_transactions').insert({
                user_id: payer_id,
                amount: creditAmount,
                reference: tx_ref,
                status: 'SUCCESSFUL',
                gateway: 'flutterwave',
            });
        } catch (auditErr) {
            console.warn('[confirmDeposit] Non-critical audit log error:', auditErr);
        }

        // --- ATOMICALLY CREDIT WALLET ---
        const { error: rpcErr } = await db.rpc('increment_wallet_balance', {
            user_id_param: payer_id,
            amount_param: creditAmount,
        });

        if (rpcErr) {
            console.warn('[confirmDeposit] RPC error, using fallback:', rpcErr);
            const { data: profile } = await db
                .from('profiles')
                .select('wallet_balance')
                .eq('id', payer_id)
                .single();
            const newBalance = Number(profile?.wallet_balance || 0) + creditAmount;
            await db
                .from('profiles')
                .update({ wallet_balance: newBalance })
                .eq('id', payer_id);
        }

        // --- IN-APP NOTIFICATION ---
        await createNotification(
            payer_id,
            'Deposit Successful ✅',
            `Your wallet has been funded with ₦${creditAmount.toLocaleString()}.`,
            '/dashboard/student?tab=wallet',
            'deposit'
        );

        // Fetch updated balance to return to client
        const { data: updated } = await db
            .from('profiles')
            .select('wallet_balance')
            .eq('id', payer_id)
            .single();

        return {
            success: true,
            newBalance: Number(updated?.wallet_balance || 0),
            creditAmount,
        };
    } catch (err: any) {
        console.error('[confirmDeposit] Error:', err);
        return { error: err.message || 'Failed to confirm deposit' };
    }
}
