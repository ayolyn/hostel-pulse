export const runtime = 'edge';
import { createClient } from '@/lib/supabase/server';
import LandingPageClient from './LandingPageClient';

export default async function Home() {
    const supabase = await createClient();
    
    // Fetch top 3 verified properties
    const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('verification_status', 'Verified')
        .order('created_at', { ascending: false })
        .limit(3);

    return <LandingPageClient latestProperties={properties || []} />;
}
