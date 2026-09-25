export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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

    const pinHash = bcrypt.hashSync(pin, 10);

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { data: securityData, error: securityError } = await supabase
      .from('user_security')
      .select('pin_set, locked_until')
      .eq('user_id', userId)
      .single();

    if (securityError && securityError.code !== 'PGRST116') {
      console.error('Error fetching user security status:', securityError);
      return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hasPinSet: securityData?.pin_set === true,
      lockedUntil: securityData?.locked_until || null
    });
  } catch (error) {
    console.error('Unexpected error in GET setup-pin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



