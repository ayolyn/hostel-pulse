const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runMigration() {
  const sql = `
    -- Create saved_properties table
    CREATE TABLE IF NOT EXISTS public.saved_properties (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(student_id, property_id)
    );

    -- Enable RLS
    ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

    -- Create policies
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'saved_properties' AND policyname = 'Students can view their own saved properties'
        ) THEN
            CREATE POLICY "Students can view their own saved properties"
                ON public.saved_properties FOR SELECT
                USING (auth.uid() = student_id);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'saved_properties' AND policyname = 'Students can save properties'
        ) THEN
            CREATE POLICY "Students can save properties"
                ON public.saved_properties FOR INSERT
                WITH CHECK (auth.uid() = student_id);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'saved_properties' AND policyname = 'Students can unsave properties'
        ) THEN
            CREATE POLICY "Students can unsave properties"
                ON public.saved_properties FOR DELETE
                USING (auth.uid() = student_id);
        END IF;
    END $$;
  `;

  // Supabase JS doesn't have a direct raw SQL method via the REST endpoint
  // without a postgres extension like pg_graphql. 
  console.log("We will use apply_migration instead...");
}
runMigration();
