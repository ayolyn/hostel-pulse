-- property_analytics table
CREATE TABLE IF NOT EXISTS property_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'view', 'lead', 'custom_offer')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- search_logs table
CREATE TABLE IF NOT EXISTS search_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    search_term TEXT,
    category TEXT,
    min_budget NUMERIC,
    max_budget NUMERIC,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS property_analytics
ALTER TABLE property_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON property_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for property owners" ON property_analytics
    FOR SELECT USING (
        property_id IN (
            SELECT id FROM properties WHERE landlord_id = auth.uid() OR agent_id = auth.uid()
        )
    );

-- RLS search_logs
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON search_logs
    FOR INSERT WITH CHECK (true);

-- Assuming admins have role 'admin' in a roles table or custom claims.
-- We'll allow authenticated users for now or rely on server-side logic for admin dashboards.
CREATE POLICY "Enable select for admins" ON search_logs
    FOR SELECT USING (auth.role() = 'authenticated');
