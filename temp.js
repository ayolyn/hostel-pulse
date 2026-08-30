const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: d1, error: e1 } = await supabase.rpc('execute_sql', { query: `CREATE POLICY "Allow authenticated users to insert inspections" ON inspections FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);` });
    console.log(d1, e1);
    
    const { data: d2, error: e2 } = await supabase.rpc('execute_sql', { query: `CREATE POLICY "Allow property owners to view inspections" ON inspections FOR SELECT TO authenticated USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM properties WHERE properties.id = inspections.property_id AND (properties.landlord_id = auth.uid() OR properties.agent_id = auth.uid())));` });
    console.log(d2, e2);
}
check();
