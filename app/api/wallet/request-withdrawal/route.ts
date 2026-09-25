export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const withdrawalSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive().min(100),
  bankAccountId: z.string().uuid(),
  pin: z.string().length(4).regex(/^\d+$/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, amount, bankAccountId, pin } = withdrawalSchema.parse(body);

    const flutterwaveKey = process.env.FLW_SECRET_KEY;
    if (!flutterwaveKey) {
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    // 1. Verify PIN and Lockout
    const { data: security, error: securityError } = await supabase
      .from('user_security')
      .select('pin_hash, failed_attempts, locked_until')
      .eq('user_id', userId)
      .single();

    if (securityError || !security) {
      return NextResponse.json({ error: 'Security PIN not set' }, { status: 403 });
    }

    if (security.locked_until && new Date(security.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Account is locked. Try again later.' }, { status: 403 });
    }

    let isPinValid = false;
    try {
      isPinValid = bcrypt.compareSync(pin, security.pin_hash);
    } catch (err) {
      isPinValid = false;
    }

    if (!isPinValid) {
      const newAttempts = security.failed_attempts + 1;
      let lockedUntil = null;
      
      if (newAttempts >= 3) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins
      }

      await supabase
        .from('user_security')
        .update({
          failed_attempts: newAttempts >= 3 ? 0 : newAttempts,
          locked_until: lockedUntil,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return NextResponse.json({ 
        error: newAttempts >= 3 ? 'Account locked for 30 minutes due to multiple failed attempts.' : 'Invalid PIN'
      }, { status: 401 });
    }

    // Reset failed attempts on success
    if (security.failed_attempts > 0) {
      await supabase
        .from('user_security')
        .update({ failed_attempts: 0, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    }

    // 2. Fetch Bank Account details
    const { data: bankAccount, error: bankError } = await supabase
      .from('saved_bank_accounts')
      .select('*')
      .eq('id', bankAccountId)
      .eq('user_id', userId)
      .single();

    if (bankError || !bankAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    // 3. Atomically debit user using RPC
    const flwReference = `HP-WD-${uuidv4()}`;
    const { data: payoutId, error: rpcError } = await supabase.rpc('process_withdrawal_debit', {
      p_user_id: userId,
      p_amount: amount,
      p_reference: flwReference,
      p_bank_code: bankAccount.bank_code,
      p_account_number: bankAccount.account_number,
      p_account_name: bankAccount.account_name
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return NextResponse.json({ error: rpcError.message || 'Failed to process withdrawal' }, { status: 400 });
    }

    // 4. Dispatch Transfer via Flutterwave
    const response = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flutterwaveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_bank: bankAccount.bank_code,
        account_number: bankAccount.account_number,
        amount: amount,
        narration: 'HostelPulse Escrow Payout',
        currency: 'NGN',
        reference: flwReference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/flutterwave/transfer`,
        debit_currency: 'NGN'
      })
    });

    const flwData = await response.json();

    if (!response.ok || flwData.status !== 'success') {
      // If dispatch fails, mark as failed and refund via a separate mechanism or immediately
      await supabase
        .from('payout_requests')
        .update({ 
          status: 'FAILED', 
          failure_reason: flwData.message || 'Transfer dispatch failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payoutId);

      // Refund the locked_balance back to balance securely
      await supabase.rpc('process_withdrawal_refund', {
         p_user_id: userId,
         p_amount: amount
      });

      return NextResponse.json({ error: 'Transfer dispatch failed: ' + flwData.message }, { status: 500 });
    }

    // Update with transfer_id
    await supabase
      .from('payout_requests')
      .update({ flw_transfer_id: flwData.data.id.toString(), updated_at: new Date().toISOString() })
      .eq('id', payoutId);

    return NextResponse.json({ success: true, message: 'Transfer dispatched successfully', data: { flw_reference: flwReference } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error in request-withdrawal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

