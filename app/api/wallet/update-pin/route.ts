export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updatePinSchema = z.object({
  userId: z.string().uuid(),
  currentPin: z.string().length(4).regex(/^\d+$/),
  newPin: z.string().length(4).regex(/^\d+$/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, currentPin, newPin } = updatePinSchema.parse(body);

    const { data: securityData, error: securityError } = await supabase
      .from('user_security')
      .select('pin_hash, locked_until')
      .eq('user_id', userId)
      .single();

    if (securityError) {
      return NextResponse.json({ error: 'Security settings not found' }, { status: 404 });
    }

    if (securityData?.locked_until && new Date(securityData.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Account is currently locked' }, { status: 403 });
    }

    const isMatch = bcrypt.compareSync(currentPin, securityData.pin_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect current PIN' }, { status: 400 });
    }

    const pinHash = bcrypt.hashSync(newPin, 10);

    const { error: updateError } = await supabase
      .from('user_security')
      .update({
        pin_hash: pinHash,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'PIN updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error in update-pin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
