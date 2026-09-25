export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resetPinSchema = z.object({
  userId: z.string().uuid(),
  otp: z.string().length(6).regex(/^\d+$/),
  newPin: z.string().length(4).regex(/^\d+$/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, otp, newPin } = resetPinSchema.parse(body);

    const { data: securityData, error: securityError } = await supabase
      .from('user_security')
      .select('reset_otp, reset_otp_expires_at')
      .eq('user_id', userId)
      .single();

    if (securityError || !securityData) {
      return NextResponse.json({ error: 'Security settings not found' }, { status: 404 });
    }

    if (!securityData.reset_otp || securityData.reset_otp !== otp) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (securityData.reset_otp_expires_at && new Date(securityData.reset_otp_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    const pinHash = bcrypt.hashSync(newPin, 10);

    const { error: updateError } = await supabase
      .from('user_security')
      .update({
        pin_hash: pinHash,
        pin_set: true,
        failed_attempts: 0,
        locked_until: null,
        reset_otp: null,
        reset_otp_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error resetting PIN in user_security:', updateError);
      throw updateError;
    }

    return NextResponse.json({ success: true, message: 'PIN reset successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error in reset-pin route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
