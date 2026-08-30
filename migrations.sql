-- 1. Create property_analytics table
DROP TABLE IF EXISTS property_analytics CASCADE;
CREATE TABLE property_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('view', 'lead', 'impression')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for property_analytics
ALTER TABLE property_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public to insert events (since non-logged in users can view properties)
CREATE POLICY "Allow public insert to analytics" ON property_analytics FOR INSERT WITH CHECK (true);

-- Allow landlords to view their own property analytics
CREATE POLICY "Allow landlords to view their property analytics" ON property_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_analytics.property_id
        AND properties.landlord_id = auth.uid()
    )
);


-- 2. Create withdrawals table
DROP TABLE IF EXISTS withdrawals CASCADE;
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for withdrawals
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own withdrawals
CREATE POLICY "Allow users to view own withdrawals" ON withdrawals FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own withdrawals
CREATE POLICY "Allow users to insert own withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. Create get_agent_leaderboard RPC
DROP FUNCTION IF EXISTS get_agent_leaderboard(text);

CREATE OR REPLACE FUNCTION get_agent_leaderboard(filter_zone text DEFAULT NULL)
RETURNS TABLE (
    agent_id uuid,
    full_name text,
    avatar_url text,
    rank_tier text,
    deals_closed bigint,
    avg_rating numeric,
    weighted_score numeric,
    success_rate numeric,
    agent_zone text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as agent_id,
        a.full_name,
        a.avatar_url,
        a.rank as rank_tier,
        (a.deals_closed + COALESCE((SELECT COUNT(*) FROM escrow_transactions e WHERE e.payee_id = a.id AND (e.status = 'Released' OR e.status = 'completed')), 0)) as deals_closed,
        COALESCE((SELECT AVG(rating) FROM provider_reviews pr WHERE pr.provider_id = a.id), 0.0) as avg_rating,
        -- Weighted Score: (Deals * 10) + (Avg_Rating * 20)
        (((a.deals_closed + COALESCE((SELECT COUNT(*) FROM escrow_transactions e WHERE e.payee_id = a.id AND (e.status = 'Released' OR e.status = 'completed')), 0)) * 10) + (COALESCE((SELECT AVG(rating) FROM provider_reviews pr WHERE pr.provider_id = a.id), 0.0) * 20)) as weighted_score,
        100.0 as success_rate,
        a.zone as agent_zone
    FROM agent_accounts a
    WHERE (filter_zone IS NULL OR filter_zone = 'All' OR a.zone = filter_zone)
    ORDER BY weighted_score DESC;
END;
$$ LANGUAGE plpgsql;
