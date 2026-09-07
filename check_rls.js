require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    const { data, error } = await supabase
        .from('properties')
        .select('*');
    console.log("Anon user query error:", error);
    console.log("Anon user query data length:", data ? data.length : 0);
}
checkRLS();
