import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: p } = await supabase.from('profiles').select('*').limit(1);
    console.log('Profiles:', p ? Object.keys(p[0]) : null);
    
    const { data: s } = await supabase.from('student_accounts').select('*').limit(1);
    console.log('Student:', s ? Object.keys(s[0]) : null);
}
check();
