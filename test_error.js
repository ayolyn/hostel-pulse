require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    const { data, error } = await supabase
          .from('properties')
          .select('id, title, location, price, main_image, bedrooms, bathrooms, verification_status')
          .eq('listing_type', 'rent')
          .in('status', ['active', 'under_inspection'])
          .order('created_at', { ascending: false })
          .limit(3);
    console.log("Error:", error);
}
testFetch();
