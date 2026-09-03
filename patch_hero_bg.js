const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Import FeaturedListings
content = content.replace(
    "import { WhyHostelPulse } from '@/components/home/WhyHostelPulse';",
    "import { WhyHostelPulse } from '@/components/home/WhyHostelPulse';\nimport { FeaturedListings } from '@/components/home/FeaturedListings';"
);

// Add Background Image to Hero Section
content = content.replace(
    'className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]"',
    'className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh] bg-[url(\'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2000&auto=format&fit=crop\')] bg-cover bg-center"\n                style={{ backgroundAttachment: "fixed" }}'
);

// Add an overlay to the Hero Section to ensure text is readable
content = content.replace(
    '<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#BEF264]/10 blur-[120px] rounded-full pointer-events-none" />',
    '<div className="absolute inset-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm z-0 pointer-events-none" />\n                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#BEF264]/20 blur-[120px] rounded-full z-0 pointer-events-none" />'
);

// Add FeaturedListings right after Journey Selector and before WhyHostelPulse
content = content.replace(
    '{/* 3. Housing Bento Grid */}',
    '<FeaturedListings />\n\n                {/* 3. Housing Bento Grid */}'
);

fs.writeFileSync('app/page.tsx', content);
console.log('Added Hero Background and FeaturedListings to app/page.tsx');
