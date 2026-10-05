export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sendNotificationEmail } from '@/lib/email/resend';
import { getEmailTemplate } from '@/app/actions/emailTemplates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const withdrawalSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive().min(50),
  totalAmount: z.number().positive().optional(),
  fee: z.number().nonnegative().optional(),
  bankAccountId: z.string().uuid(),
  pin: z.string().length(4).regex(/^\d+$/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, amount, totalAmount, fee, bankAccountId, pin } = withdrawalSchema.parse(body);

    // 1. Verify PIN and Lockout
    const { data: security, error: securityError } = await supabase
      .from('user_security')
      .select('pin_hash, failed_attempts, locked_until')
      .eq('user_id', userId)
      .single();

    if (securityError || !security) {
      return NextResponse.json({ error: 'Security PIN not set. Please configure your PIN in Security Settings.' }, { status: 403 });
    }

    if (security.locked_until && new Date(security.locked_until) > new Date()) {
      const waitMins = Math.ceil((new Date(security.locked_until).getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json({ error: `Account locked due to multiple failed attempts. Try again in ${waitMins} minutes.` }, { status: 403 });
    }

    let isPinValid = false;
    try {
      isPinValid = bcrypt.compareSync(pin, security.pin_hash);
    } catch (err) {
      isPinValid = false;
    }

    if (!isPinValid) {
      const newAttempts = (security.failed_attempts || 0) + 1;
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
        error: newAttempts >= 3 ? 'Account locked for 30 minutes due to 3 failed attempts.' : 'Invalid PIN entered.'
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
      return NextResponse.json({ error: 'Selected bank account was not found.' }, { status: 404 });
    }

    // 3. Fetch profile and verify funds
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance, full_name, contact_email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Failed to fetch user profile balance.' }, { status: 400 });
    }

    const userBalance = Number(profile.wallet_balance || 0);
    const withdrawalFee = typeof fee === 'number' ? fee : 50;

    // Determine totalDeduct (from wallet) and netAmount (to send to bank)
    let totalDeduct: number;
    let netAmount: number;

    if (typeof totalAmount === 'number' && totalAmount > 0) {
      totalDeduct = totalAmount;
      netAmount = amount;
    } else {
      // Legacy fallback
      if (userBalance >= amount + withdrawalFee && amount <= userBalance - withdrawalFee) {
        // user specified net amount to receive
        netAmount = amount;
        totalDeduct = amount + withdrawalFee;
      } else {
        // user specified gross amount to deduct from wallet
        totalDeduct = amount;
        netAmount = Math.max(0, amount - withdrawalFee);
      }
    }

    if (userBalance < totalDeduct) {
      return NextResponse.json({ 
        error: `Insufficient funds in wallet. Available balance: ₦${userBalance.toLocaleString()}` 
      }, { status: 400 });
    }

    if (netAmount < 50) {
      return NextResponse.json({ 
        error: 'Net payout must be at least ₦50 after the ₦50 processing fee.' 
      }, { status: 400 });
    }

    // 4. Ensure wallets table is synchronized with profile balance before RPC call
    try {
      await supabase.from('wallets').upsert({
        user_id: userId,
        balance: userBalance,
        currency: 'NGN',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } catch (syncErr) {
      console.warn('Non-critical wallet sync warning:', syncErr);
    }

    // 5. Atomically debit user wallet using Postgres RPC (Locks balance and queues in payout_requests)
    const flwReference = `HP-WD-${uuidv4()}`;
    let payoutId: string | null = null;

    const { data: rpcPayoutId, error: rpcError } = await supabase.rpc('process_withdrawal_debit', {
      p_user_id: userId,
      p_amount: totalDeduct,
      p_reference: flwReference,
      p_bank_code: bankAccount.bank_code,
      p_account_number: bankAccount.account_number,
      p_account_name: bankAccount.account_name,
      p_bank_name: bankAccount.bank_name || ''
    });

    if (rpcError) {
      console.warn('RPC process_withdrawal_debit failed, falling back to direct atomic debit:', rpcError);
      
      // Fallback: Atomic balance deduction on profiles table
      const { data: updatedProfile, error: deductErr } = await supabase
        .from('profiles')
        .update({ wallet_balance: userBalance - totalDeduct })
        .eq('id', userId)
        .gte('wallet_balance', totalDeduct)
        .select('wallet_balance')
        .single();

      if (deductErr || !updatedProfile) {
        return NextResponse.json({ error: 'Insufficient funds or concurrent withdrawal in progress.' }, { status: 400 });
      }

      // Also deduct from wallets table
      try {
        await supabase.from('wallets').update({
          balance: Math.max(0, userBalance - totalDeduct),
          updated_at: new Date().toISOString()
        }).eq('user_id', userId);
      } catch (wErr) {
        console.warn('Fallback wallets update non-critical warning:', wErr);
      }

      // Insert directly into payout_requests
      const { data: newPayout, error: poErr } = await supabase
        .from('payout_requests')
        .insert({
          user_id: userId,
          amount: netAmount,
          bank_code: bankAccount.bank_code,
          account_number: bankAccount.account_number,
          account_name: bankAccount.account_name,
          bank_name: bankAccount.bank_name || '',
          flw_reference: flwReference,
          status: 'PROCESSING',
          admin_notes: `Fee: ₦${withdrawalFee}. Net Payout: ₦${netAmount}. Total Deducted: ₦${totalDeduct}.`
        })
        .select('id')
        .single();

      if (poErr) {
        // Rollback profiles balance
        await supabase.from('profiles').update({ wallet_balance: userBalance }).eq('id', userId);
        throw poErr;
      }
      payoutId = newPayout?.id;
    } else {
      payoutId = rpcPayoutId;

      // Update payout_requests to ensure netAmount and bank_name are accurately saved
      await supabase.from('payout_requests').update({
        amount: netAmount,
        bank_name: bankAccount.bank_name || '',
        admin_notes: `Fee: ₦${withdrawalFee}. Net Payout: ₦${netAmount}. Total Deducted: ₦${totalDeduct}.`
      }).eq('id', payoutId);

      // Atomically decrement profiles.wallet_balance to maintain perfect parity with wallets table
      await supabase
        .from('profiles')
        .update({ wallet_balance: userBalance - totalDeduct })
        .eq('id', userId);
    }

    let userEmail = profile?.contact_email || '';
    if (!userEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (authUser?.user?.email) userEmail = authUser.user.email;
    }
    const userName = profile?.full_name || bankAccount.account_name || 'HostelPulse User';
    const bankName = bankAccount.bank_name || 'Bank';

    // 6. In-App Notification
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Withdrawal Queued ⏳',
        message: `Your withdrawal of ₦${netAmount.toLocaleString()} to ${bankName} (${bankAccount.account_number}) is queued for admin review. ₦${totalDeduct.toLocaleString()} debited from wallet (includes ₦${withdrawalFee} fee).`,
        type: 'WITHDRAWAL_QUEUED',
        link: '/dashboard?tab=wallet'
      });
    } catch (nErr) {
      console.warn('Failed to insert in-app notification:', nErr);
    }

    // 7. Send Transactional Receipt Email to User
    if (userEmail) {
      const userHtml = getEmailTemplate({
        subHeading: 'WALLET WITHDRAWAL',
        title: 'Withdrawal Request Received 💸',
        body: `Hello ${userName},<br/><br/>We have received your withdrawal request. Here is your transaction breakdown:<br/><br/>
        💰 <strong>Net Payout (You Receive):</strong> ₦${netAmount.toLocaleString()}<br/>
        💳 <strong>Total Debited from Wallet:</strong> ₦${totalDeduct.toLocaleString()}<br/>
        ⚡ <strong>Processing Fee:</strong> ₦${withdrawalFee.toLocaleString()}<br/><br/>
        <strong>Account Details:</strong><br/>
        🏦 <strong>Bank:</strong> ${bankName}<br/>
        🔢 <strong>Account Number:</strong> ${bankAccount.account_number}<br/>
        👤 <strong>Account Name:</strong> ${bankAccount.account_name}<br/>
        🔖 <strong>Reference:</strong> ${flwReference}<br/><br/>
        Your funds have been securely held and queued for rapid disbursement. You will receive another notification once funds are sent to your bank.`,
        buttonText: 'View Wallet Status',
        buttonLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hostelpulse.app'}/dashboard?tab=wallet`,
        showFallbackLink: false
      });
      await sendNotificationEmail(userEmail, 'Hostel Pulse: Withdrawal Request Received 💸', userHtml);
    }

    // 8. Send Alert Email to Admin HQ for instant review
    const adminHtml = getEmailTemplate({
      subHeading: 'ADMIN ALERT - ACTION REQUIRED',
      title: 'New Payout Request Submitted 🚨',
      body: `A new withdrawal payout requires your review and approval in Global HQ:<br/><br/>
      👤 <strong>User:</strong> ${userName} (${userEmail || 'No email'})<br/>
      💸 <strong>Net Amount to Disburse:</strong> ₦${netAmount.toLocaleString()}<br/>
      📊 <strong>Total Deducted from User:</strong> ₦${totalDeduct.toLocaleString()} (₦${withdrawalFee} platform fee)<br/>
      🏦 <strong>Bank:</strong> ${bankName}<br/>
      🔢 <strong>Account Number:</strong> <code>${bankAccount.account_number}</code><br/>
      👤 <strong>Verified Name:</strong> ${bankAccount.account_name}<br/>
      🔖 <strong>Ref:</strong> ${flwReference}<br/><br/>
      Log in to Global HQ to copy the account number, disburse ₦${netAmount.toLocaleString()}, and approve the payout.`,
      buttonText: 'Open Payout Approvals HQ',
      buttonLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hostelpulse.app'}/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c?tab=payouts`,
      showFallbackLink: false
    });

    const adminEmails = ['juliusayolyn@gmail.com', 'info@hostelpulse.app'];
    for (const aEmail of adminEmails) {
      await sendNotificationEmail(aEmail, `[Action Required] New Payout: ₦${netAmount.toLocaleString()} - ${bankAccount.account_name}`, adminHtml);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal request submitted! It will be reviewed and credited to your bank account shortly.', 
      data: { 
        payoutId, 
        reference: flwReference,
        status: 'PENDING',
        netAmount,
        totalDeduct,
        fee: withdrawalFee,
        newBalance: userBalance - totalDeduct
      } 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error in request-withdrawal:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}


