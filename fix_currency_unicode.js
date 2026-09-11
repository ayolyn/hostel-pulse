const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

const idx = file.indexOf('?{Number(hostel.price)');
if (idx > -1) {
    const newFile = file.slice(0, idx) + '{"\\u20A6"}' + file.slice(idx + 1);
    fs.writeFileSync('components/home/FeaturedListings.tsx', newFile, 'utf8');
    console.log("Fixed with unicode literal!");
}
