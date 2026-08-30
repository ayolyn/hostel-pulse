import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

async function runTest() {
    console.log("🚀 Starting Admin Vault Test...");

    // 1. Fetch pending withdrawals
    const { data: withdrawals, error: wError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending');

    if (wError) {
        console.error("❌ Error fetching withdrawals:", wError);
        return;
    }

    console.log(`✅ Found ${withdrawals.length} pending withdrawals.`);

    if (withdrawals.length > 0) {
        const testW = withdrawals[0];
        console.log(`🔄 Attempting to approve withdrawal ID: ${testW.id} for amount: ₦${testW.amount}`);
        
        // Approve it (Simulating the Server Action)
        const { error: updateErr } = await supabase
            .from('withdrawals')
            .update({ status: 'completed' })
            .eq('id', testW.id);

        if (updateErr) {
            console.error("❌ Failed to approve withdrawal:", updateErr);
        } else {
            console.log("✅ Withdrawal successfully marked as 'completed'!");
            
            // Re-fetch to verify
            const { data: updatedW } = await supabase
                .from('withdrawals')
                .select('status')
                .eq('id', testW.id)
                .single();
                
            console.log(`🔍 Verification Check - New Status: ${updatedW?.status}`);
        }
    } else {
        console.log("⚠️ No pending withdrawals found to test. Try creating a withdrawal from the Agent Wallet first!");
    }

    console.log("✅ Admin Vault Test Completed.");
}

runTest();
