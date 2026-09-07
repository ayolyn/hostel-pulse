const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

// Remove icons from metadata
file = file.replace(/    icons: \{\s*icon: \[\s*\{\s*url: '\/favicon\.svg', type: 'image\/svg\+xml'\s*\}\s*\],\s*apple: \[\s*\{\s*url: '\/favicon\.svg', type: 'image\/svg\+xml'\s*\}\s*\]\s*\},/g, '');

// Inject link tag inside <head>
// Let's find <head>
file = file.replace(/<head>/, '<head>\n                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />');

fs.writeFileSync('app/layout.tsx', file, 'utf8');
console.log('Fixed layout.tsx for Cloudflare');
