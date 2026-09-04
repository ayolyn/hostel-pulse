const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

file = file.replace(/hover:bg-\[\#BEF264\]\/100 hover:text-white dark:hover:bg-\[\#BEF264\]\/100 text-gray-900 dark:text-white/g, 'hover:bg-[#BEF264] hover:text-black dark:hover:bg-[#BEF264] text-gray-900 dark:text-white dark:hover:text-black');

fs.writeFileSync('components/home/FeaturedListings.tsx', file, 'utf8');
console.log('Fixed button hover text color');
