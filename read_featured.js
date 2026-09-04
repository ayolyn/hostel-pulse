const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');
console.log(file);
