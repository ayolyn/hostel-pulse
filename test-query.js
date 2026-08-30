const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('non_student_accounts')
    .select('*')
    .or('is_approved.eq.false,is_approved.is.null')
    .order('created_at', { ascending: true });
    
  console.log('Result:', { data, error });
}

test();
