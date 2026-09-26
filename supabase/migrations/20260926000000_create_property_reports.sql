-- Create property_reports table
CREATE TABLE IF NOT EXISTS public.property_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'dismissed', 'resolved'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.property_reports ENABLE ROW LEVEL SECURITY;

-- Allow insert by any authenticated user or anonymous visitor
DROP POLICY IF EXISTS "Allow insert on property_reports" ON public.property_reports;
CREATE POLICY "Allow insert on property_reports" 
ON public.property_reports FOR INSERT WITH CHECK (true);

-- Allow super_admin to read and update reports
DROP POLICY IF EXISTS "Allow super_admin all on property_reports" ON public.property_reports;
CREATE POLICY "Allow super_admin all on property_reports" 
ON public.property_reports FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND LOWER(role) = 'super_admin'
    )
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_property_reports_status ON public.property_reports(status);
CREATE INDEX IF NOT EXISTS idx_property_reports_property ON public.property_reports(property_id);
