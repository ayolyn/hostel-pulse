import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using service role key if possible? No, anon key is fine if RLS allows it, but let's see.
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAll() {
    console.log("--- ROLES ---");
    const { data: roles } = await supabase.from('user_roles').select('*');
    console.log(roles);

    console.log("--- PROFILES ---");
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url');
    console.log(profiles);

    console.log("--- LANDLORDS ---");
    const { data: landlords } = await supabase.from('landlord_accounts').select('id, business_name, is_approved, is_verified, compliance_submitted');
    console.log(landlords);

    console.log("--- AGENTS ---");
    const { data: agents } = await supabase.from('agent_accounts').select('id, full_name, is_approved, is_verified, compliance_submitted');
    console.log(agents);
}

inspectAll().catch(console.error);
