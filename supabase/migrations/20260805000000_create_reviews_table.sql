CREATE TABLE IF NOT EXISTS provider_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_interaction BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;

-- Select policy: anyone can read reviews
CREATE POLICY "Public reviews are viewable by everyone" ON provider_reviews
    FOR SELECT USING (true);

-- Insert policy: authenticated users can insert reviews, but not for themselves
CREATE POLICY "Users can insert their own reviews for others" ON provider_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND 
        auth.uid() != provider_id
    );

-- Update/Delete policies: users can manage their own reviews
CREATE POLICY "Users can update their own reviews" ON provider_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON provider_reviews
    FOR DELETE USING (auth.uid() = reviewer_id);
