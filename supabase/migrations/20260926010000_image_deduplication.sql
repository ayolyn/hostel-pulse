-- Migration: Automated Image De-Duplication and Admin Verification Queue
-- File: supabase/migrations/20260926010000_image_deduplication.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Create listing_images table
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_phash TEXT NOT NULL, -- 64-bit perceptual hash (stored as 16 hex chars)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for listing_images
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Allow public read of listing_images
DROP POLICY IF EXISTS "Allow public read on listing_images" ON public.listing_images;
CREATE POLICY "Allow public read on listing_images"
ON public.listing_images FOR SELECT USING (true);

-- Allow authenticated insert on listing_images
DROP POLICY IF EXISTS "Allow insert on listing_images" ON public.listing_images;
CREATE POLICY "Allow insert on listing_images"
ON public.listing_images FOR INSERT WITH CHECK (true);

-- Allow authenticated delete on listing_images
DROP POLICY IF EXISTS "Allow delete on listing_images" ON public.listing_images;
CREATE POLICY "Allow delete on listing_images"
ON public.listing_images FOR DELETE USING (
    auth.uid() IS NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listing_images_property_id ON public.listing_images(property_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_phash ON public.listing_images(image_phash);

-- 2. Add de-duplication columns to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS duplicate_match_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS duplicate_confidence_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS duplicate_flagged_image TEXT,
ADD COLUMN IF NOT EXISTS co_lister_ids UUID[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_properties_duplicate_match ON public.properties(duplicate_match_property_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- 3. Add infraction_strikes to agent_accounts, landlord_accounts and profiles
ALTER TABLE public.agent_accounts
ADD COLUMN IF NOT EXISTS infraction_strikes INTEGER DEFAULT 0;

ALTER TABLE public.landlord_accounts
ADD COLUMN IF NOT EXISTS infraction_strikes INTEGER DEFAULT 0;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS infraction_strikes INTEGER DEFAULT 0;

-- 4. PostgreSQL helper function to compute Hamming distance between two perceptual hashes
-- Supports 16-hex characters (64 bits) or 64-char binary strings.
CREATE OR REPLACE FUNCTION public.hamming_distance(h1 text, h2 text)
RETURNS integer AS $$
DECLARE
    b1 bytea;
    b2 bytea;
    xor_byte integer;
    dist integer := 0;
    i integer;
BEGIN
    IF h1 IS NULL OR h2 IS NULL THEN
        RETURN 64;
    END IF;

    -- 16-character hexadecimal strings (64-bit hash)
    IF length(h1) = 16 AND length(h2) = 16 AND h1 ~* '^[0-9a-f]{16}$' AND h2 ~* '^[0-9a-f]{16}$' THEN
        b1 := decode(lpad(h1, 16, '0'), 'hex');
        b2 := decode(lpad(h2, 16, '0'), 'hex');
        FOR i IN 0..7 LOOP
            xor_byte := get_byte(b1, i) # get_byte(b2, i);
            WHILE xor_byte > 0 LOOP
                dist := dist + (xor_byte & 1);
                xor_byte := xor_byte >> 1;
            END LOOP;
        END LOOP;
        RETURN dist;
    END IF;

    -- 64-character binary strings
    IF length(h1) = 64 AND length(h2) = 64 AND h1 ~ '^[01]+$' AND h2 ~ '^[01]+$' THEN
        FOR i IN 1..64 LOOP
            IF substr(h1, i, 1) <> substr(h2, i, 1) THEN
                dist := dist + 1;
            END IF;
        END LOOP;
        RETURN dist;
    END IF;

    RETURN 64;
EXCEPTION WHEN OTHERS THEN
    RETURN 64;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
