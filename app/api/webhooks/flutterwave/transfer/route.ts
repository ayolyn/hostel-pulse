import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('verif-hash');
    const secretHash = process.env.FLW_SECRET_HASH;

    if (!signature || signature !== secretHash) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    if (payload.event === 'transfer.completed') {
      const transferData = payload.data;
      const flwReference = transferData.reference;
      const transferStatus = transferData.status; // 'SUCCESSFUL' or 'FAILED'

      const { data: payoutRequest, error: fetchError } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('flw_reference', flwReference)
        .single();

      if (fetchError || !payoutRequest) {
        console.error('Webhook: Payout request not found for ref:', flwReference);
        return NextResponse.json({ success: true }); // Acknowledge to stop retries
      }

      if (payoutRequest.status !== 'PROCESSING') {
        // Already handled
        return NextResponse.json({ success: true });
      }

      if (transferStatus === 'SUCCESSFUL') {
        // Transfer successful: deduct from locked_balance permanently
        await supabase.rpc('process_withdrawal_success', {
          p_user_id: payoutRequest.user_id,
          p_amount: payoutRequest.amount
        });

        await supabase
          .from('payout_requests')
          .update({ status: 'SUCCESSFUL', updated_at: new Date().toISOString() })
          .eq('id', payoutRequest.id);

      } else if (transferStatus === 'FAILED' || transferStatus === 'REVERSED') {
        // Transfer failed: refund from locked_balance to balance
        await supabase.rpc('process_withdrawal_refund', {
          p_user_id: payoutRequest.user_id,
          p_amount: payoutRequest.amount
        });

        await supabase
          .from('payout_requests')
          .update({ 
              status: 'FAILED', 
              failure_reason: transferData.complete_message || 'Transfer failed at provider',
              updated_at: new Date().toISOString()
          })
          .eq('id', payoutRequest.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
