"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { processFlutterwaveTransfer } from "./flutterwave";

export async function requestPayout(payload: {
    amount: number;
    bankName: string; // This will now be the bank code from the UI
    accountNumber: string;
}) {
    try {
        const supabase = await createServerClient();

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
        if (payload.amount <= 0) {
            return { error: "Invalid withdrawal amount." };
        }
        if (currentBalance < payload.amount) {
            return { error: "Insufficient funds for this withdrawal." };
        }

        // 4. Process Payout via Flutterwave Live API
        const transferResult = await processFlutterwaveTransfer(payload.amount, payload.bankName, payload.accountNumber);
        
        if (transferResult.error) {
            return { error: `Transfer Failed: ${transferResult.error}` };
        }

        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        // 5. Create Withdrawal Request
        const { error: withdrawalError } = await adminClient
            .from("withdrawals")
            .insert({
                seller_id: user.id,
                amount: payload.amount,
                status: "pending", // Flutterwave transfers take a little time; webhook will mark completed
                bank_name: payload.bankName,
                account_number: payload.accountNumber
            });

        if (withdrawalError) {
            console.error("Withdrawal insert error:", withdrawalError);
            // Non-blocking, but ideally we should track this
        }

        // 6. Deduct from wallet balance atomically
        const { error: updateError } = await adminClient.rpc(
            "increment_wallet_balance",
            { payee_id_param: user.id, amount_param: -payload.amount }
        );

        if (updateError) {
            console.error("Wallet update error after withdrawal:", updateError);
            return { error: "Failed to update wallet balance." };
        }

        // 7. Send Notification
        await adminClient.from("notifications").insert({
            user_id: user.id,
            title: "Withdrawal Initiated",
            message: `Your withdrawal of ₦${payload.amount.toLocaleString()} is being processed.`,
            type: "withdrawal",
            is_read: false
        });

        // 8. Revalidate dashboard
        revalidatePath("/dashboard/landlord");
        revalidatePath("/dashboard/agent");

        return { success: true, newBalance: currentBalance - payload.amount };

    } catch (err: any) {
        console.error("requestPayout Exception:", err);
        return { error: "An unexpected error occurred." };
    }
}
