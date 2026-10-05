"use server";

import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';
import { sendNotificationEmail } from '@/lib/email/resend';
import { getEmailTemplate } from '@/app/actions/emailTemplates';

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

        // --- SYNC WALLETS TABLE ---
        try {
            const { data: wRow } = await db.from('wallets').select('balance').eq('user_id', payer_id).maybeSingle();
            if (wRow) {
                await db.from('wallets').update({
                    balance: Number(wRow.balance || 0) + creditAmount,
                    updated_at: new Date().toISOString()
                }).eq('user_id', payer_id);
            } else {
                await db.from('wallets').insert({
                    user_id: payer_id,
                    balance: creditAmount,
                    currency: 'NGN'
                });
            }
        } catch (wErr) {
            console.warn('[confirmDeposit] wallets table sync error (non-critical):', wErr);
        }

        // --- IN-APP NOTIFICATION ---
        await createNotification(
            payer_id,
            'Deposit Successful ✅',
            `Your wallet has been funded with ₦${creditAmount.toLocaleString()}.`,
            '/dashboard/student?tab=wallet',
            'deposit'
        );

        // --- TRANSACTIONAL EMAIL RECEIPT ---
        try {
            let depositorEmail = '';
            let depositorName = 'Hostel Pulse Member';

            const { data: profile } = await db
                .from('profiles')
                .select('contact_email, full_name')
                .eq('id', payer_id)
                .maybeSingle();

            if (profile?.contact_email) {
                depositorEmail = profile.contact_email;
            } else {
                const { data: authData } = await db.auth.admin.getUserById(payer_id);
                if (authData?.user?.email) {
                    depositorEmail = authData.user.email;
                }
            }

            if (profile?.full_name) {
                depositorName = profile.full_name;
            }

            if (depositorEmail && depositorEmail.includes('@')) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hostelpulse.app';
                const emailHtml = getEmailTemplate({
                    subHeading: 'WALLET TOP-UP CONFIRMED',
                    title: 'Deposit Successful ✅',
                    body: `
                        <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">Hello ${depositorName},</p>
                        <p style="font-size:15px;line-height:1.6;margin:0 0 20px 0;">
                            Your deposit has been successfully confirmed and your Hostel Pulse wallet has been credited.
                        </p>
                        <div style="background-color:rgba(190,242,100,0.1);border:1px solid #BEF264;border-radius:16px;padding:20px;margin:24px 0;">
                            <p style="margin:0 0 8px 0;font-size:14px;color:#BEF264;text-transform:uppercase;letter-spacing:1px;font-weight:900;">Amount Credited</p>
                            <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;">₦${creditAmount.toLocaleString()}</p>
                            <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:#94A3B8;">
                                <span>Reference: <code>${tx_ref}</code></span>
                            </div>
                        </div>
                        <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0;">
                            You can now use your wallet balance for instant bookings, rent escrow, and student market deals on Hostel Pulse.
                        </p>
                    `,
                    buttonText: 'View Wallet in Dashboard',
                    buttonLink: `${appUrl}/dashboard/student?tab=wallet`,
                    showFallbackLink: false,
                });

                await sendNotificationEmail(
                    depositorEmail,
                    'Deposit Successful ✅ - Wallet Funded',
                    emailHtml
                ).catch(err => console.error('[confirmDeposit] sendNotificationEmail catch:', err));
            }
        } catch (emailErr) {
            console.error('[confirmDeposit] Failed to send deposit receipt email (non-critical):', emailErr);
        }

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
