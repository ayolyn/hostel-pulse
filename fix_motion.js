const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

file = file.replace(/<\/h2>/, '</motion.h2>');
file = file.replace(/<\/p>/, '</motion.p>');

fs.writeFileSync('components/home/FeaturedListings.tsx', file, 'utf8');
console.log('Fixed motion tags');
