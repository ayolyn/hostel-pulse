const fs = require('fs');
let content = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');
content = content.replace(
    '<FeaturedListings properties={latestProperties || undefined} />',
    '<FeaturedListings />'
);
fs.writeFileSync('app/LandingPageClient.tsx', content, 'utf8');
console.log('Fixed LandingPageClient');
