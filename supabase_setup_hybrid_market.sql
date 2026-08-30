-- ============================================================
-- 1. UPGRADE PROFILES
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ DEFAULT NULL;

-- ============================================================
-- 2. UPGRADE MARKET LISTINGS
-- ============================================================
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('Electronics', 'Furniture', 'Textbooks', 'Fashion', 'Services', 'Other'));

-- ============================================================
-- 3. ENFORCE BASIC LISTING LIMITS (POSTGRES TRIGGER)
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_market_listing_limit()
RETURNS TRIGGER AS $$
DECLARE
    seller_tier TEXT;
    active_count INT;
BEGIN
    -- Count active listings
    SELECT COUNT(*) INTO active_count 
    FROM market_listings 
    WHERE seller_id = NEW.seller_id AND status = 'active';

    -- Get seller tier
    SELECT subscription_tier INTO seller_tier 
    FROM profiles 
    WHERE id = NEW.seller_id;

    -- Enforce limit
    IF seller_tier = 'basic' AND active_count >= 3 THEN
        RAISE EXCEPTION 'Basic users are capped at 3 active listings. Upgrade to Pro for unlimited selling.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_listing_limit_before_insert ON market_listings;
CREATE TRIGGER check_listing_limit_before_insert
    BEFORE INSERT ON market_listings
    FOR EACH ROW
    EXECUTE FUNCTION enforce_market_listing_limit();
