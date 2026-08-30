CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Declined')),
    check_in_date DATE,
    duration_months INTEGER NOT NULL DEFAULT 12,
    total_price NUMERIC NOT NULL,
    escrow_id UUID REFERENCES escrow_transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Students can see their own bookings
CREATE POLICY "Students can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = student_id);

-- Providers can see bookings for their properties
CREATE POLICY "Providers can view bookings for their properties" ON bookings
    FOR SELECT USING (auth.uid() = provider_id);

-- Students can insert bookings
CREATE POLICY "Students can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Both can update (student to confirm move-in, provider to decline/accept)
CREATE POLICY "Users can update relevant bookings" ON bookings
    FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = provider_id);
