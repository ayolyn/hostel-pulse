import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking landlords...");
    const { data: landlords } = await supabase.from('landlord_accounts').select('id, business_name, full_name, is_approved, is_verified');
    console.log("Landlords:", landlords);

    console.log("Checking properties...");
    const { data: properties } = await supabase.from('properties').select('id, title, owner_id, landlord_id, agent_id, verification_status');
    console.log("Properties:", properties);
}

inspect().catch(console.error);
