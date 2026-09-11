const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

file = file.replace(/<div className="absolute bottom-4 left-4 bg-black\/80 backdrop-blur text-white px-4 py-2 rounded-xl text-lg font-black">\s*.*?\{Number\(hostel\.price\)\.toLocaleString\(\)\}/, '<div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur text-white px-4 py-2 rounded-xl text-lg font-black">\n                  ?{Number(hostel.price).toLocaleString()}');

fs.writeFileSync('components/home/FeaturedListings.tsx', file, 'utf8');
