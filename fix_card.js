const fs = require('fs');
let content = fs.readFileSync('components/ui/PropertyCard.tsx', 'utf8');

// The corrupted Naira sign usually shows up as ? or similar.
// Let's replace any instances of '?' with '₦'.
content = content.replace(/\?/g, '₦');
content = content.replace(/\?/g, '₦');

fs.writeFileSync('components/ui/PropertyCard.tsx', content, 'utf8');
