import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes, scryptSync } from 'crypto';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const setupPinSchema = z.object({
  userId: z.string().uuid(),
  pin: z.string().length(4).regex(/^\d+$/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, pin } = setupPinSchema.parse(body);

    const { data: securityData, error: securityError } = await supabase
      .from('user_security')
      .select('locked_until')
      .eq('user_id', userId)
      .single();

    if (securityError && securityError.code !== 'PGRST116') {
      throw securityError;
    }

    if (securityData?.locked_until && new Date(securityData.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Account is currently locked' }, { status: 403 });
    }

    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(pin, salt, 64).toString('hex');
    const pinHash = `${salt}:${derivedKey}`;

    const { error: upsertError } = await supabase
      .from('user_security')
      .upsert({
        user_id: userId,
        pin_hash: pinHash,
        pin_set: true,
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, message: 'PIN set successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error in setup-pin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
