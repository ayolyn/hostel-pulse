const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

file = file.replace('?{Number(hostel.price).toLocaleString()}', '?{Number(hostel.price).toLocaleString()}');
file = file.replace('{Number(hostel.price).toLocaleString()}', '?{Number(hostel.price).toLocaleString()}');

fs.writeFileSync('components/home/FeaturedListings.tsx', file, 'utf8');
