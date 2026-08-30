import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixApproval() {
    console.log("Fixing landlord approvals using service_role key...");
    
    // Update Landlord
    const { data: lData, error: landlordError } = await supabase
        .from('landlord_accounts')
        .update({ is_approved: true, is_verified: true, compliance_submitted: true })
        .eq('id', '71772244-8215-4e4e-90d8-bf389400c900')
        .select();
        
    if (landlordError) {
        console.error("Error updating landlord:", landlordError);
    } else {
        console.log("Landlord account fixed:", lData);
    }

    // Update Agent
    const { data: aData, error: agentError } = await supabase
        .from('agent_accounts')
        .update({ is_approved: true, is_verified: true, compliance_submitted: true })
        .eq('id', 'ce8ebac1-866c-425d-a138-89e61e469ec0')
        .select();
        
    if (agentError) {
        console.error("Error updating agent:", agentError);
    } else {
        console.log("Agent account fixed:", aData);
    }
}

fixApproval().catch(console.error);
