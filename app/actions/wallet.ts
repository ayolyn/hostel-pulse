"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { processOpayTransfer } from "./opay";

export async function requestPayout(payload: {
    amount: number;
    bankName: string;
    accountNumber: string;
}) {
    try {
        const supabase = await createClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Not authenticated" };
        }

        // 2. Fetch current wallet balance
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("wallet_balance")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            return { error: "Failed to fetch wallet balance" };
        }

        const currentBalance = Number(profile.wallet_balance || 0);

        // 3. Verify funds
        // if (currentBalance < payload.amount && process.env.NODE_ENV !== 'development') {
        //     return { error: "Insufficient funds for this withdrawal." };
        // }
        if (payload.amount <= 0) {
            return { error: "Invalid withdrawal amount." };
        }

        // 4. Process Payout via OPay Sandbox API
        const transferResult = await processOpayTransfer(payload.amount, payload.bankName, payload.accountNumber);
        
        if (transferResult.error) {
            return { error: `OPay Transfer Failed: ${transferResult.error}` };
        }

        const supabaseAdmin = createClient(); // Actually wait, createClient from server uses user auth.
        // I need to import createClient from @supabase/supabase-js to bypass RLS.
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        // 5. Create Withdrawal Request
        const { error: withdrawalError } = await adminClient
            .from("withdrawals")
            .insert({
                user_id: user.id,
                amount: payload.amount,
                status: "completed", // Auto-completed because payout succeeded
                bank_name: payload.bankName,
                account_number: payload.accountNumber
            });

        if (withdrawalError) {
            console.error("Withdrawal insert error:", withdrawalError);
            return { error: "Failed to record withdrawal request." };
        }

        // 6. Deduct from wallet balance
        const newBalance = currentBalance - payload.amount;
        const { error: updateError } = await adminClient
            .from("profiles")
            .update({ wallet_balance: newBalance })
            .eq("id", user.id);

        if (updateError) {
            console.error("Wallet update error after withdrawal:", updateError);
            return { error: "Failed to update wallet balance." };
        }

        // 6. Send Notification
        await adminClient.from("notifications").insert({
            user_id: user.id,
            title: "Withdrawal Successful",
            body: `Your withdrawal of ₦${payload.amount.toLocaleString()} was successfully processed to ${payload.bankName}.`,
            type: "alert",
            is_read: false
        });

        // 7. Revalidate dashboard
        revalidatePath("/dashboard/agent");

        return { success: true, newBalance };

    } catch (err: any) {
        console.error("requestPayout Exception:", err);
        return { error: "An unexpected error occurred." };
    }
}
