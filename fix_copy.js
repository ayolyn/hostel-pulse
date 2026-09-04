const fs = require('fs');
let file = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

file = file.replace(
    'Book Your <br />\n                            <span className="text-emerald-500 relative inline-block">\n                                Safe Home.',
    'Your Campus <br />\n                            <span className="text-emerald-500 relative inline-block">\n                                Ecosystem.'
);

fs.writeFileSync('app/LandingPageClient.tsx', file, 'utf8');
console.log('Fixed copy');
