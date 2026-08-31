const fs = require('fs');
let content = fs.readFileSync('components/market/CampusMarket.tsx', 'utf-8');

// Grid structure
content = content.replace(
    /className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"/,
    'className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"'
);

// Card rounding and padding
content = content.replace(
    /className="bg-white dark:bg-neutral-900 rounded-\[2rem\] overflow-hidden border/g,
    'className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border'
);

content = content.replace(
    /<div className="p-6 flex flex-col flex-1">/g,
    '<div className="p-3 sm:p-4 flex flex-col flex-1">'
);

// Font sizes
content = content.replace(
    /<p className="text-\[#0D9488\] font-black text-sm">/g,
    '<p className="text-[#0D9488] font-black text-xs">'
);

content = content.replace(
    /<h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1/g,
    '<h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1'
);

// Buttons Layout
content = content.replace(
    /<div className="grid grid-cols-2 gap-2">/g,
    '<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">'
);

// Fix location icon margin
content = content.replace(
    /<MapPin className="w-3 h-3 text-gray-400" \/>/g,
    '<MapPin className="w-3 h-3 text-gray-400 shrink-0" />'
);

fs.writeFileSync('components/market/CampusMarket.tsx', content, 'utf-8');
console.log("Updated CampusMarket.tsx layout");
