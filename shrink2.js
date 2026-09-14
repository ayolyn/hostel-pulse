const fs = require('fs');
let content = fs.readFileSync('components/dashboard/RoommatesTab.tsx', 'utf8');

content = content.replace(/rounded-3xl/g, 'rounded-2xl');
content = content.replace(/p-6/g, 'p-4');
content = content.replace(/text-2xl/g, 'text-lg');
content = content.replace(/mb-8/g, 'mb-4');
content = content.replace(/space-y-8/g, 'space-y-4');
content = content.replace(/w-16 h-16/g, 'w-10 h-10');
content = content.replace(/w-32 h-32/g, 'w-20 h-20');
content = content.replace(/py-3/g, 'py-2');
content = content.replace(/px-5/g, 'px-4');

fs.writeFileSync('components/dashboard/RoommatesTab.tsx', content, 'utf8');
