const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

// Replace main_image in fallback
file = file.replace(/main_image: "https:\/\/images\.unsplash\.com\/photo-1522708323590-d24dbb6b0267\?q=80&w=800&auto=format&fit=crop",/g, 'images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop"],');
file = file.replace(/main_image: "https:\/\/images\.unsplash\.com\/photo-1555854877-bab0e564b8d5\?q=80&w=800&auto=format&fit=crop",/g, 'images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"],');
// Replace broken 3rd image with a fresh unsplash URL
file = file.replace(/main_image: "https:\/\/images\.unsplash\.com\/photo-1502672260266-1c1e52504437\?q=80&w=800&auto=format&fit=crop",/g, 'images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800&auto=format&fit=crop"],');

// Fix query
file = file.replace(
    /\.select\('id, title, location, price, main_image, bedrooms, bathrooms, verification_status'\)/g,
    ".select('id, title, location, price, images, bedrooms, bathrooms, verification_status')"
);

// Fix img src
file = file.replace(
    /src=\{hostel\.main_image \|\| "https:\/\/images\.unsplash\.com\/photo-1522708323590-d24dbb6b0267\?q=80&w=800"\}/g,
    'src={(hostel.images && hostel.images[0]) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800"}'
);

// Fix Naira symbol
file = file.replace(
    /\\u20A6\{Number\(hostel\.price\)\.toLocaleString\(\)\}/g,
    '?{Number(hostel.price).toLocaleString()}'
);


fs.writeFileSync('components/home/FeaturedListings.tsx', file, 'utf8');
console.log('Fixed DB query and Naira sign');
