-- Harden user_roles RLS policies to prevent privilege escalation
-- Demote test student account juliusayolyn@gmail.com if it still has super_admin
UPDATE public.user_roles 
SET role = 'student' 
WHERE user_id = 'eb3b2881-529c-4978-bf52-92bf62e45a51';

-- Drop insecure insert/update policies
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow user update role" ON public.user_roles;

-- Recreate strict insert policy: authenticated users can only insert standard roles
CREATE POLICY "Users can insert their own role" ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND LOWER(role) IN ('student', 'agent', 'landlord', 'non_student')
);
