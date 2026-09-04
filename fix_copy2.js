const fs = require('fs');
let file = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

file = file.replace(
    'Ogbomoso\'s only verified housing network. Anti-scam escrow protection for Under-G, Adenike, and General students.',
    'Ogbomoso\'s first all-in-one student network. Rent verified hostels, book campus gigs, buy & sell items, and find roommates safely.'
);

fs.writeFileSync('app/LandingPageClient.tsx', file, 'utf8');
console.log('Fixed subcopy');
