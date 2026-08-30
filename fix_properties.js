import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProperties() {
    console.log('Updating all pending properties to active...');
    const { data, error } = await supabase
        .from('properties')
        .update({ 
            status: 'active',
            verification_status: 'Verified'
        })
        .or('status.eq.pending,verification_status.eq.Pending')
        .select('id, title, status, verification_status');

    if (error) {
        console.error('Error updating properties:', error);
    } else {
        console.log(`Updated ${data.length} properties to active successfully.`);
    }
}

fixProperties();
