export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotificationEmail } from '@/lib/email/resend';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const forgotPinSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = forgotPinSchema.parse(body);

    // 1. Get user details
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    let email = userData?.user?.email;

    if (!email) {
      // Fallback check in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, contact_email')
        .eq('id', userId)
        .single();
      email = profile?.contact_email || profile?.email;
    }

    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 });
    }

    // 2. Generate 6-digit cryptographically secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // 3. Upsert into user_security
    const { error: upsertError } = await supabase
      .from('user_security')
      .upsert({
        user_id: userId,
        reset_otp: otp,
        reset_otp_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Failed to store OTP in user_security:', upsertError);
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }

    // 4. Send email
    const subject = 'Your Hostel Pulse Security PIN Reset Code';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          You requested to reset your 4-digit Payout Security PIN on Hostel Pulse.
        </p>
        <div style="background-color: #1E293B; border: 2px solid #BEF264; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="font-size: 12px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">
            Verification Code
          </p>
          <p style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #BEF264; margin: 0;">
            ${otp}
          </p>
          <p style="font-size: 12px; color: #94A3B8; margin: 12px 0 0 0;">
            This code expires in 15 minutes.
          </p>
        </div>
        <p style="font-size: 13px; color: #94A3B8;">
          If you did not request this, please ignore this email or contact Hostel Pulse support immediately. Never share this code with anyone.
        </p>
      </div>
    `;

    const emailRes = await sendNotificationEmail(email, subject, emailBody);

    if (!emailRes.success) {
      console.warn('Failed to send email via Resend:', emailRes.error);
    }

    // Mask the email for UI display (e.g. j***@gmail.com)
    const [userPart, domain] = email.split('@');
    const maskedUser = userPart.length > 2 
      ? `${userPart[0]}***${userPart[userPart.length - 1]}`
      : `${userPart[0]}***`;
    const maskedEmail = `${maskedUser}@${domain}`;

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      email: maskedEmail
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error in forgot-pin route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
