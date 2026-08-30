-- ============================================================
-- 1. CAMPUS MARKET LISTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_escrow', 'sold', 'delisted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE market_listings DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. ESCROW TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES market_listings(id) ON DELETE SET NULL,
  property_id UUID, -- placeholder for future hostel lease escrow
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'held' CHECK (status IN ('held', 'released', 'disputed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE escrow_transactions DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. PHASE 2 POSTGRESQL TRIGGERS
-- ============================================================

-- Trigger A: Market Listings -> 'pending_escrow'
CREATE OR REPLACE FUNCTION trigger_market_listing_notifications()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending_escrow' AND OLD.status != 'pending_escrow' THEN
        PERFORM create_notification(
            NEW.seller_id,
            'New Order',
            'New Order: A buyer has locked funds in Escrow for your item. Please arrange delivery.',
            'info'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_market_listing_update ON market_listings;
CREATE TRIGGER on_market_listing_update
    AFTER UPDATE ON market_listings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_market_listing_notifications();


-- Trigger B & C: Escrow Transactions
CREATE OR REPLACE FUNCTION trigger_escrow_transaction_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- 'released' status
    IF NEW.status = 'released' AND OLD.status != 'released' THEN
        PERFORM create_notification(
            NEW.seller_id,
            'Payment Released',
            'Payment Released! ₦' || NEW.amount::TEXT || ' has been transferred to your wallet for the completed transaction.',
            'success'
        );
    END IF;

    -- 'disputed' status
    IF NEW.status = 'disputed' AND OLD.status != 'disputed' THEN
        -- Notify Buyer
        PERFORM create_notification(
            NEW.buyer_id,
            'Escrow Dispute Raised',
            'Escrow Dispute Raised: A dispute has been opened. Our admin team will review the issue shortly.',
            'warning'
        );
        -- Notify Seller
        PERFORM create_notification(
            NEW.seller_id,
            'Escrow Dispute Raised',
            'Escrow Dispute Raised: A dispute has been opened. Our admin team will review the issue shortly.',
            'warning'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_escrow_transaction_update ON escrow_transactions;
CREATE TRIGGER on_escrow_transaction_update
    AFTER UPDATE ON escrow_transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_escrow_transaction_notifications();
