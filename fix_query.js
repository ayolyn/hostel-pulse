const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

file = file.replace(
    ".select('id, title, location, price, main_image, bedrooms, bathrooms, is_verified')",
    ".select('id, title, location, price, main_image, bedrooms, bathrooms, verification_status')"
);

file = file.replace(
    'is_verified: true,',
    'verification_status: "Verified",'
);
file = file.replace(
    'is_verified: true,',
    'verification_status: "Verified",'
);
file = file.replace(
    'is_verified: true,',
    'verification_status: "Verified",'
);

file = file.replace(
    'hostel.is_verified',
    'hostel.verification_status === "Verified"'
);

fs.writeFileSync('components/home/FeaturedListings.tsx', file, 'utf8');
console.log('Fixed query');
