const fs = require('fs');
let page = fs.readFileSync('app/page.tsx', 'utf8');

// Remove use client and states
page = page.replace("'use client';\n", "");
page = page.replace("import { useState, useEffect } from 'react';\n", "");
page = page.replace("import { motion, AnimatePresence } from 'framer-motion';\n", "");

// Import AnimatedHeroText and Supabase Server Client
page = page.replace(
    "import { PublicHeader } from '@/components/layout/PublicHeader';",
    "import { PublicHeader } from '@/components/layout/PublicHeader';\nimport { AnimatedHeroText } from '@/components/home/AnimatedHeroText';\nimport { createClient } from '@/lib/supabase/server';"
);

// Remove the old AnimatedHeroText declaration
page = page.replace(/const AnimatedHeroText = \(\) => \{[\s\S]*?return \([\s\S]*?\);\n\};\n/, "");

// Make Home async
page = page.replace(
    'export default function Home() {',
    'export default async function Home() {\n    const supabase = await createClient();\n    const { data: latestProperties } = await supabase.from("properties").select("*").eq("verification_status", "Verified").order("created_at", { ascending: false }).limit(3);'
);

// Fix Hero Background to be forced dark mode for premium look
page = page.replace(
    'className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh] bg-[url(\'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2000&auto=format&fit=crop\')] bg-cover bg-center"\n                style={{ backgroundAttachment: "fixed" }}>\n                <div className="absolute inset-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm z-0 pointer-events-none" />\n                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#BEF264]/20 blur-[120px] rounded-full z-0 pointer-events-none" />',
    'className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh] bg-[#050505] bg-[url(\'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2000&auto=format&fit=crop\')] bg-cover bg-center"\n                style={{ backgroundAttachment: "fixed" }}>\n                {/* Forced dark mode overlay for the hero to make it look premium always */}\n                <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm z-0 pointer-events-none" />\n                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#BEF264]/15 blur-[120px] rounded-full z-0 pointer-events-none" />'
);

// Force Hero text to be white/emerald
page = page.replace(
    '<h1 className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 text-gray-900 dark:text-white">',
    '<h1 className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 text-white">'
);
page = page.replace(
    '<span className="text-[#BEF264]">Handled.</span>',
    '<span className="text-emerald-400">Handled.</span>'
);

// Pass properties to FeaturedListings
page = page.replace(
    '<FeaturedListings />',
    '<FeaturedListings properties={latestProperties || undefined} />'
);

fs.writeFileSync('app/page.tsx', page, 'utf8');
console.log('Updated app/page.tsx for server fetching and dark hero');
