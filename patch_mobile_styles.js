const fs = require('fs');

// Fix app/page.tsx
let pageContent = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Reduce hero font on mobile
pageContent = pageContent.replace(
    'text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 leading-[1.1]',
    'text-[2.5rem] leading-[1.1] sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4'
);

// 2. Increase spacing between hero text and search bar
pageContent = pageContent.replace(
    '<div className="max-w-2xl mx-auto w-full mt-12">',
    '<div className="max-w-2xl mx-auto w-full mt-20 md:mt-24">'
);

// 3. Reduce Gig Network mobile title font
pageContent = pageContent.replace(
    '<h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">Get anything done in minutes.</h2>',
    '<h2 className="text-[1.75rem] leading-tight sm:text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">Get anything done in minutes.</h2>'
);

fs.writeFileSync('app/page.tsx', pageContent, 'utf8');


// Fix WhyHostelPulse.tsx
let whyContent = fs.readFileSync('components/home/WhyHostelPulse.tsx', 'utf8');

// Reduce Direct Response Header font on mobile
whyContent = whyContent.replace(
    'text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight',
    'text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight'
);

fs.writeFileSync('components/home/WhyHostelPulse.tsx', whyContent, 'utf8');

console.log("Mobile typography and spacing patched successfully.");
