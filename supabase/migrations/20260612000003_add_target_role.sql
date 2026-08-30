-- Add target_role to system_announcements
ALTER TABLE public.system_announcements 
ADD COLUMN IF NOT EXISTS target_role TEXT NOT NULL DEFAULT 'all';
