const fs = require('fs');
let content = fs.readFileSync('components/home/WhyHostelPulse.tsx', 'utf8');

content = content.replace(
    'className="py-20 bg-[#0a0a0a] text-white overflow-hidden"',
    'className="py-20 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden"'
);

// Fix "text-white" to "text-gray-900 dark:text-white" where appropriate
content = content.replace(
    /<h2 className="text-3xl md:text-5xl font-black mb-6">/,
    '<h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">'
);

content = content.replace(
    /text-gray-400/g,
    'text-gray-600 dark:text-gray-400'
);

content = content.replace(
    /bg-\[#111\]/g,
    'bg-gray-50 dark:bg-[#111]'
);

content = content.replace(
    /border-white\/10/g,
    'border-gray-200 dark:border-white/10'
);

// Review card backgrounds in WhyHostelPulse
content = content.replace(
    /bg-black\/50/g,
    'bg-white/50 dark:bg-black/50'
);

content = content.replace(
    /text-white/g,
    'text-gray-900 dark:text-white'
);

fs.writeFileSync('components/home/WhyHostelPulse.tsx', content);
console.log('Fixed WhyHostelPulse.tsx');
