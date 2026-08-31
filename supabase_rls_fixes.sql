-- ============================================================
-- 🔥 CRITICAL SECURITY FIXES: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Run this script in your Supabase SQL Editor.
-- It enables RLS on all tables and safely replaces existing policies.

-- 1. PROPERTIES
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active properties" ON properties;
CREATE POLICY "Public can view active properties" ON properties FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Landlords can view own properties" ON properties;
CREATE POLICY "Landlords can view own properties" ON properties FOR SELECT USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can insert properties" ON properties;
CREATE POLICY "Landlords can insert properties" ON properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can update own properties" ON properties;
CREATE POLICY "Landlords can update own properties" ON properties FOR UPDATE USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can delete own properties" ON properties;
CREATE POLICY "Landlords can delete own properties" ON properties FOR DELETE USING (auth.uid() = landlord_id);


-- 2. INSPECTIONS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view relevant inspections" ON inspections;
CREATE POLICY "Users can view relevant inspections" ON inspections FOR SELECT USING (
  auth.uid() = requester_id OR 
  auth.uid() IN (SELECT landlord_id FROM properties WHERE id = property_id)
);

DROP POLICY IF EXISTS "Students can request inspections" ON inspections;
CREATE POLICY "Students can request inspections" ON inspections FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update relevant inspections" ON inspections;
CREATE POLICY "Users can update relevant inspections" ON inspections FOR UPDATE USING (
  auth.uid() = requester_id OR 
  auth.uid() IN (SELECT landlord_id FROM properties WHERE id = property_id)
);


-- 3. USER ROLES & ACCOUNTS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- Student Accounts
ALTER TABLE student_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can manage own account" ON student_accounts;
CREATE POLICY "Students can manage own account" ON student_accounts FOR ALL USING (auth.uid() = id);

-- Non-Student Accounts
ALTER TABLE non_student_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Non-Students can manage own account" ON non_student_accounts;
CREATE POLICY "Non-Students can manage own account" ON non_student_accounts FOR ALL USING (auth.uid() = id);

-- Landlord Accounts
ALTER TABLE landlord_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Landlords can view all landlord accounts (for properties)" ON landlord_accounts;
CREATE POLICY "Landlords can view all landlord accounts (for properties)" ON landlord_accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Landlords can modify own account" ON landlord_accounts;
CREATE POLICY "Landlords can modify own account" ON landlord_accounts FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Landlords can insert own account" ON landlord_accounts;
CREATE POLICY "Landlords can insert own account" ON landlord_accounts FOR INSERT WITH CHECK (auth.uid() = id);

-- Agent Accounts
ALTER TABLE agent_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view agents" ON agent_accounts;
CREATE POLICY "Anyone can view agents" ON agent_accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agents can modify own account" ON agent_accounts;
CREATE POLICY "Agents can modify own account" ON agent_accounts FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Agents can insert own account" ON agent_accounts;
CREATE POLICY "Agents can insert own account" ON agent_accounts FOR INSERT WITH CHECK (auth.uid() = id);


-- 4. MARKET LISTINGS
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view market listings" ON market_listings;
CREATE POLICY "Anyone can view market listings" ON market_listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own market listings" ON market_listings;
CREATE POLICY "Users can insert own market listings" ON market_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update own market listings" ON market_listings;
CREATE POLICY "Users can update own market listings" ON market_listings FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete own market listings" ON market_listings;
CREATE POLICY "Users can delete own market listings" ON market_listings FOR DELETE USING (auth.uid() = seller_id);


-- 5. ESCROW TRANSACTIONS
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own escrows" ON escrow_transactions;
CREATE POLICY "Users can view own escrows" ON escrow_transactions FOR SELECT USING (
  auth.uid() = payer_id OR 
  auth.uid() = landlord_id OR 
  auth.uid() = agent_id
);
-- NO insert/update policies for normal authenticated users here. Only the backend (service role) can do this.


-- 6. NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
