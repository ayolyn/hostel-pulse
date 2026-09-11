const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

const idx = file.indexOf('{Number(hostel.price)');
if (idx > -1) {
    const corruptedChar = file.charAt(idx - 1);
    console.log("Current char code:", corruptedChar.charCodeAt(0));
}
