const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

const lines = file.split('\n');
const newLines = lines.map(line => {
    if (line.includes('{Number(hostel.price).toLocaleString()}')) {
        return '                  ?{Number(hostel.price).toLocaleString()}<span className="text-sm font-normal text-gray-300">/yr</span>';
    }
    return line;
});

fs.writeFileSync('components/home/FeaturedListings.tsx', newLines.join('\n'), 'utf8');
