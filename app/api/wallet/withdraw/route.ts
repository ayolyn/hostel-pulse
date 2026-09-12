export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const { amount, bankName, accountNumber, accountName } = await req.json();
        
        if (!amount || amount <= 0 || !bankName || !accountNumber || !accountName) {
            return NextResponse.json({ error: "Invalid withdrawal parameters." }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Authenticate user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Security Check: Fetch wallet balance
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Could not fetch wallet balance." }, { status: 400 });
        }

        const balance = Number(profile.wallet_balance || 0);
        const withdrawAmount = Number(amount);

        if (balance < withdrawAmount) {
            return NextResponse.json({ error: "Insufficient funds in wallet." }, { status: 400 });
        }

        // 3. Admin Execution
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Atomic deduction: only deduct if balance is still sufficient (prevents TOCTOU race condition)
        const { data: updatedProfile, error: deductError } = await supabaseAdmin
            .from('profiles')
            .update({ wallet_balance: balance - withdrawAmount })
            .eq('id', user.id)
            .gte('wallet_balance', withdrawAmount)
            .select('wallet_balance')
            .single();

        if (deductError || !updatedProfile) {
            return NextResponse.json({ error: "Insufficient funds or concurrent withdrawal in progress." }, { status: 400 });
        }

        // Log transaction as 'pending' (payout not yet dispatched to bank)
        const { error: withdrawError } = await supabaseAdmin
            .from('withdrawals')
            .insert({
                seller_id: user.id,
                amount: withdrawAmount,
                bank_name: bankName,
                account_number: accountNumber,
                account_name: accountName,
                status: 'pending'
            });

        if (withdrawError) {
            // Rollback: use atomic increment to avoid overwriting any concurrent deposits
            await supabaseAdmin.rpc('increment_wallet_balance', { payee_id_param: user.id, amount_param: withdrawAmount });
            throw withdrawError;
        }


        // Add Notification
        await createNotification(
            user.id,
            'Withdrawal Successful',
            `Your withdrawal of ₦${withdrawAmount.toLocaleString()} to ${bankName} was processed successfully.`,
            '/dashboard/student?tab=wallet',
            'withdrawal'
        );

        return NextResponse.json({ success: true, newBalance: balance - withdrawAmount });

    } catch (error: any) {
        console.error('Withdraw API error:', error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
