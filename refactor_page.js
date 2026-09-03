const fs = require('fs');

// Move existing page.tsx to LandingPageClient.tsx
let clientPage = fs.readFileSync('app/page.tsx', 'utf8');

// Add back 'use client'
clientPage = '"use client";\n\n' + clientPage;
// We need to restore the useState/useEffect imports that I accidentally removed
clientPage = clientPage.replace(
    "import { Home, Zap, Search",
    "import { useState, useEffect } from 'react';\nimport { Home, Zap, Search"
);

// Accept properties as a prop
clientPage = clientPage.replace(
    'export default function LandingPage() {',
    'export default function LandingPageClient({ latestProperties }: { latestProperties: any[] }) {'
);

// We need to pass the prop to FeaturedListings
// Currently it says `<FeaturedListings properties={latestProperties || undefined} />` 
// Which is correct, but it expects `latestProperties` from props now.

fs.writeFileSync('app/LandingPageClient.tsx', clientPage, 'utf8');

// Now create the new server component app/page.tsx
const serverPage = `import { createClient } from '@/lib/supabase/server';
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
`;

fs.writeFileSync('app/page.tsx', serverPage, 'utf8');

console.log('Refactored page.tsx to server component');
