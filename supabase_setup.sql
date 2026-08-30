# Full DB Setup — Run this in Supabase SQL Editor
# https://supabase.com/dashboard/project/hyophkwnbhrmacjdxdba/sql/new

# ============================================================
# 1. PROPERTIES TABLE
# ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Hostel',
  listing_type TEXT NOT NULL DEFAULT 'rent',
  price_label TEXT DEFAULT 'Yearly Rent',
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  verification_status TEXT DEFAULT 'Pending',
  is_active BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

# ============================================================
# 2. INSPECTIONS TABLE
# ============================================================
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;

# ============================================================
# 3. ACCOUNT TABLES
# ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  matric_number TEXT,
  university TEXT DEFAULT 'LAUTECH',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS non_student_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  occupation TEXT,
  intent TEXT DEFAULT 'rent',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS landlord_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  zone TEXT DEFAULT 'Ogbomoso',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE non_student_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_accounts DISABLE ROW LEVEL SECURITY;

# ============================================================
# 4. Add missing columns safely (for existing tables)
# ============================================================
ALTER TABLE student_accounts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE non_student_accounts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE landlord_accounts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE agent_accounts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

UPDATE student_accounts SET is_approved = FALSE WHERE is_approved IS NULL;
UPDATE non_student_accounts SET is_approved = FALSE WHERE is_approved IS NULL;
UPDATE landlord_accounts SET is_approved = FALSE WHERE is_approved IS NULL;
UPDATE agent_accounts SET is_approved = FALSE WHERE is_approved IS NULL;
