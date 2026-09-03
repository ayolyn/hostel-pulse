const fs = require('fs');
let content = fs.readFileSync('components/home/FAQSection.tsx', 'utf8');

content = content.replace(
    'className="py-20 bg-[#0a0a0a] text-white"',
    'className="py-20 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white"'
);

content = content.replace(
    /text-gray-400/g,
    'text-gray-600 dark:text-gray-400'
);

content = content.replace(
    /bg-white\/5/g,
    'bg-gray-50 dark:bg-white/5'
);

content = content.replace(
    /border-white\/10/g,
    'border-gray-200 dark:border-white/10'
);

content = content.replace(
    /hover:bg-white\/10/g,
    'hover:bg-gray-100 dark:hover:bg-white/10'
);

fs.writeFileSync('components/home/FAQSection.tsx', content);
console.log('Fixed FAQSection.tsx');
