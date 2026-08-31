-- ============================================================
-- 🔥 CRITICAL SECURITY FIXES: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Run this script in your Supabase SQL Editor.
-- It enables RLS on all tables and adds safe policies to prevent
-- hackers from modifying properties, accounts, and payments.

-- 1. PROPERTIES
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- Anyone can view active properties
CREATE POLICY "Public can view active properties" ON properties FOR SELECT USING (is_active = TRUE);
-- Landlords can view all their own properties (even inactive)
CREATE POLICY "Landlords can view own properties" ON properties FOR SELECT USING (auth.uid() = landlord_id);
-- Landlords can insert properties
CREATE POLICY "Landlords can insert properties" ON properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);
-- Landlords can update their own properties
CREATE POLICY "Landlords can update own properties" ON properties FOR UPDATE USING (auth.uid() = landlord_id);
-- Landlords can delete their own properties
CREATE POLICY "Landlords can delete own properties" ON properties FOR DELETE USING (auth.uid() = landlord_id);

-- 2. INSPECTIONS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
-- Students (requesters) can view their own inspections, and property owners can view inspections on their properties
CREATE POLICY "Users can view relevant inspections" ON inspections FOR SELECT USING (
  auth.uid() = requester_id OR 
  auth.uid() IN (SELECT landlord_id FROM properties WHERE id = property_id)
);
-- Students can insert inspections for themselves
CREATE POLICY "Students can request inspections" ON inspections FOR INSERT WITH CHECK (auth.uid() = requester_id);
-- Requesters and Landlords can update inspections (e.g. status)
CREATE POLICY "Users can update relevant inspections" ON inspections FOR UPDATE USING (
  auth.uid() = requester_id OR 
  auth.uid() IN (SELECT landlord_id FROM properties WHERE id = property_id)
);

-- 3. USER ROLES & ACCOUNTS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- Users can read their own roles
CREATE POLICY "Users can read own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- Student Accounts
ALTER TABLE student_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can manage own account" ON student_accounts FOR ALL USING (auth.uid() = id);

-- Non-Student Accounts
ALTER TABLE non_student_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Non-Students can manage own account" ON non_student_accounts FOR ALL USING (auth.uid() = id);

-- Landlord Accounts
ALTER TABLE landlord_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landlords can view all landlord accounts (for properties)" ON landlord_accounts FOR SELECT USING (true);
CREATE POLICY "Landlords can modify own account" ON landlord_accounts FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Landlords can insert own account" ON landlord_accounts FOR INSERT WITH CHECK (auth.uid() = id);

-- Agent Accounts
ALTER TABLE agent_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view agents" ON agent_accounts FOR SELECT USING (true);
CREATE POLICY "Agents can modify own account" ON agent_accounts FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Agents can insert own account" ON agent_accounts FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. MARKET LISTINGS
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view market listings" ON market_listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own market listings" ON market_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own market listings" ON market_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own market listings" ON market_listings FOR DELETE USING (auth.uid() = seller_id);

-- 5. ESCROW TRANSACTIONS
-- Ensure RLS is enabled to prevent hackers from inserting fake completed escrows
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own escrows" ON escrow_transactions FOR SELECT USING (
  auth.uid() = payer_id OR 
  auth.uid() = landlord_id OR 
  auth.uid() = agent_id
);
-- ONLY the Service Role (the backend webhook) should be able to insert/update escrow transactions to prevent fake payments.
-- NO insert/update policies for normal authenticated users!

-- 6. NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
-- Allow users to insert if necessary, though ideally created by triggers or backend.
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
