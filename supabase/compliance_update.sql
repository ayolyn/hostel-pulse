-- ==============================================================================
-- COMPLIANCE UPDATE FOR LANDLORDS AND AGENTS
-- Run this in your Supabase SQL Editor to add the necessary compliance fields.
-- ==============================================================================

-- 1. Add fields to landlord_accounts
ALTER TABLE landlord_accounts
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS office_address TEXT,
ADD COLUMN IF NOT EXISTS about_organization TEXT,
ADD COLUMN IF NOT EXISTS services_provided TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS govt_id_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS cac_document_url TEXT,
ADD COLUMN IF NOT EXISTS compliance_submitted BOOLEAN DEFAULT FALSE;

-- 2. Add fields to agent_accounts
ALTER TABLE agent_accounts
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS office_address TEXT,
ADD COLUMN IF NOT EXISTS about_organization TEXT,
ADD COLUMN IF NOT EXISTS services_provided TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS govt_id_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS cac_document_url TEXT,
ADD COLUMN IF NOT EXISTS compliance_submitted BOOLEAN DEFAULT FALSE;

-- 3. Ensure existing accounts have compliance_submitted strictly set to false (in case null)
UPDATE landlord_accounts SET compliance_submitted = FALSE WHERE compliance_submitted IS NULL;
UPDATE agent_accounts SET compliance_submitted = FALSE WHERE compliance_submitted IS NULL;

-- 4. Enable Storage bucket for documents if not exists (This usually needs to be done via UI or dedicated API, but here is the reference SQL)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('compliance_docs', 'compliance_docs', false)
-- ON CONFLICT (id) DO NOTHING;
