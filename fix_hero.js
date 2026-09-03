const fs = require('fs');
let page = fs.readFileSync('app/page.tsx', 'utf8');

// Remove background image and overlays
page = page.replace(
    'className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh] bg-[url(\'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2000&auto=format&fit=crop\')] bg-cover bg-center"\n                style={{ backgroundAttachment: "fixed" }}',
    'className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]"'
);
page = page.replace(
    '<div className="absolute inset-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm z-0 pointer-events-none" />\n                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#BEF264]/20 blur-[120px] rounded-full z-0 pointer-events-none" />',
    '<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#BEF264]/10 blur-[120px] rounded-full pointer-events-none" />'
);

// Replace AnimatedHeroText with static
page = page.replace(
    'import { AnimatedHeroText } from \'@/components/home/AnimatedHeroText\';',
    ''
);
page = page.replace(
    '<AnimatedHeroText />',
    '<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto mt-6">The only app you need to survive LAUTECH. Find verified hostels, book campus gigs, and never get scammed again.</p>'
);

fs.writeFileSync('app/page.tsx', page, 'utf8');
console.log('Fixed hero section style and copy');
