const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

// Find the index of '{Number(hostel.price)'
const idx = file.indexOf('{Number(hostel.price)');
if (idx > -1) {
    const corruptedChar = file.charAt(idx - 1);
    console.log("Corrupted char code:", corruptedChar.charCodeAt(0));
    
    // Replace it
    const newFile = file.slice(0, idx - 1) + '?' + file.slice(idx);
    fs.writeFileSync('components/home/FeaturedListings.tsx', newFile, 'utf8');
    console.log("Fixed!");
}
