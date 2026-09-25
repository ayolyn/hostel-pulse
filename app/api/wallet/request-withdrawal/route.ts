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
  amount: z.number().positive().min(100),
  bankAccountId: z.string().uuid(),
  pin: z.string().length(4).regex(/^\d+$/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, amount, bankAccountId, pin } = withdrawalSchema.parse(body);

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

    // 3. Atomically debit user wallet using Postgres RPC (Locks balance and queues in payout_requests)
    const flwReference = `HP-WD-${uuidv4()}`;
    const { data: payoutId, error: rpcError } = await supabase.rpc('process_withdrawal_debit', {
      p_user_id: userId,
      p_amount: amount,
      p_reference: flwReference,
      p_bank_code: bankAccount.bank_code,
      p_account_number: bankAccount.account_number,
      p_account_name: bankAccount.account_name,
      p_bank_name: bankAccount.bank_name || ''
    });

    if (rpcError) {
      console.error('RPC Error processing withdrawal debit:', rpcError);
      return NextResponse.json({ error: rpcError.message || 'Failed to process withdrawal. Check your wallet balance.' }, { status: 400 });
    }

    // 4. Fetch user details for notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, contact_email, email')
      .eq('id', userId)
      .single();

    const userEmail = profile?.contact_email || profile?.email;
    const userName = profile?.full_name || bankAccount.account_name || 'HostelPulse User';
    const bankName = bankAccount.bank_name || 'Bank';

    // 5. In-App Notification
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Withdrawal Queued ⏳',
        message: `Your withdrawal of ₦${amount.toLocaleString()} to ${bankName} (${bankAccount.account_number}) is queued for admin review.`,
        type: 'WITHDRAWAL_QUEUED',
        link: '/dashboard?tab=wallet'
      });
    } catch (nErr) {
      console.warn('Failed to insert in-app notification:', nErr);
    }

    // 6. Send Transactional Receipt Email to User
    if (userEmail) {
      const userHtml = getEmailTemplate({
        subHeading: 'WALLET WITHDRAWAL',
        title: 'Withdrawal Request Received 💸',
        body: `Hello ${userName},<br/><br/>We have received your withdrawal request of <strong>₦${amount.toLocaleString()}</strong> to your verified account:<br/><br/>
        🏦 <strong>Bank:</strong> ${bankName}<br/>
        🔢 <strong>Account Number:</strong> ${bankAccount.account_number}<br/>
        👤 <strong>Account Name:</strong> ${bankAccount.account_name}<br/>
        🔖 <strong>Reference:</strong> ${flwReference}<br/><br/>
        Your funds have been securely locked in escrow and will be reviewed and credited to your account shortly.`,
        buttonText: 'View Wallet Status',
        buttonLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hostelpulse.app'}/dashboard?tab=wallet`,
        showFallbackLink: false
      });
      await sendNotificationEmail(userEmail, 'Hostel Pulse: Withdrawal Request Received 💸', userHtml);
    }

    // 7. Send Alert Email to Admin HQ for instant review
    const adminHtml = getEmailTemplate({
      subHeading: 'ADMIN ALERT - ACTION REQUIRED',
      title: 'New Payout Request Submitted 🚨',
      body: `A new withdrawal payout requires your review and approval in Global HQ:<br/><br/>
      👤 <strong>User:</strong> ${userName} (${userEmail || 'No email'})<br/>
      💰 <strong>Amount:</strong> ₦${amount.toLocaleString()}<br/>
      🏦 <strong>Bank:</strong> ${bankName}<br/>
      🔢 <strong>Account Number:</strong> <code>${bankAccount.account_number}</code><br/>
      👤 <strong>Verified Name:</strong> ${bankAccount.account_name}<br/>
      🔖 <strong>Ref:</strong> ${flwReference}<br/><br/>
      Log in to Global HQ to copy the account number, disburse funds, and approve the payout.`,
      buttonText: 'Open Payout Approvals HQ',
      buttonLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hostelpulse.app'}/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c?tab=payouts`,
      showFallbackLink: false
    });

    const adminEmails = ['juliusayolyn@gmail.com', 'info@hostelpulse.app'];
    for (const aEmail of adminEmails) {
      await sendNotificationEmail(aEmail, `[Action Required] New Payout: ₦${amount.toLocaleString()} - ${bankAccount.account_name}`, adminHtml);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal request submitted! It will be reviewed and credited to your bank account shortly.', 
      data: { 
        payoutId, 
        reference: flwReference,
        status: 'PENDING'
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


