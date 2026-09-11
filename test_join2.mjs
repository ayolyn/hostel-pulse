import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            agent:agent_accounts (
                full_name,
                phone,
                whatsapp_number,
                avatar_url,
                rank
            )
        `)
        .limit(1);
    console.log(error || "Success");
}
test();
