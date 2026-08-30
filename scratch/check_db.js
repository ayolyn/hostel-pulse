require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log("Checking inspections...");
    const { data: insps, error: err1 } = await supabase.from('inspections').select('*');
    if (err1) console.error("Error fetching inspections:", err1);
    else console.log(`Found ${insps.length} inspections:`, JSON.stringify(insps, null, 2));

    console.log("Checking properties...");
    const { data: props, error: err2 } = await supabase.from('properties').select('id, title, owner_id, landlord_id');
    if (err2) console.error("Error fetching properties:", err2);
    else console.log(`Found ${props.length} properties:`, JSON.stringify(props, null, 2));

    console.log("Testing join query...");
    const { data: joinData, error: joinErr } = await supabase
        .from('inspections')
        .select(`
            id, scheduled_at, status, inspection_fee, requester_id, property_id,
            properties (id, title, images),
            requester:profiles!requester_id (id, full_name)
        `);
    
    if (joinErr) console.error("Join Error:", joinErr);
    else console.log("Join Success!", joinData.length);
}

check();
