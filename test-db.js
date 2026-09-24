const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data, error } = await supabase.from('deposits').select('*').limit(1);
    console.log("DEPOSITS: ", error || data);
    const { data: wData, error: wError } = await supabase.from('wallet_transactions').select('*').limit(1);
    console.log("WALLET TX: ", wError || wData);
}
run();
