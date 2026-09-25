export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const verifyBankSchema = z.object({
  userId: z.string().uuid(),
  account_number: z.string().min(10).max(10).regex(/^\d+$/),
  bank_code: z.string(),
  bank_name: z.string(),
});

function calculateLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, account_number, bank_code, bank_name } = verifyBankSchema.parse(body);

    const flutterwaveKey = process.env.FLW_SECRET_KEY;
    if (!flutterwaveKey) {
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Call Flutterwave Account Resolution
    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flutterwaveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account_number, account_bank: bank_code }),
    });

    const flwData = await response.json();

    if (!response.ok || flwData.status !== 'success') {
      return NextResponse.json({ error: 'Could not resolve bank account with provider' }, { status: 400 });
    }

    const resolvedName = flwData.data.account_name;
    const registeredName = profile.full_name;

    // Split and sanitize names for comparison
    const resolvedParts = resolvedName.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
    const registeredParts = registeredName.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);

    let matches = 0;
    for (const rPart of registeredParts) {
      for (const resPart of resolvedParts) {
        if (resPart === rPart || calculateLevenshteinDistance(resPart, rPart) <= 2) {
          matches++;
          break;
        }
      }
    }

    // Require at least one part (e.g. first or last name) to match strongly, or preferably two
    if (matches < 1) {
      return NextResponse.json({ 
        error: 'Account name mismatch. Third-party accounts are prohibited.',
        resolvedName: resolvedName 
      }, { status: 400 });
    }

    // Save verified bank account
    const { data: savedAccount, error: saveError } = await supabase
      .from('saved_bank_accounts')
      .insert({
        user_id: userId,
        bank_code,
        bank_name,
        account_number,
        account_name: resolvedName,
        is_verified: true
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return NextResponse.json({ success: true, data: savedAccount });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error in verify-bank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

