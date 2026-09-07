const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

// Remove hardcoded link tags
file = file.replace(/<link rel="icon" type="image\/png" href="\/favicon\.svg" \/>\n/g, '');
file = file.replace(/<link rel="shortcut icon" href="\/favicon\.svg" \/>\n/g, '');
file = file.replace(/<link rel="apple-touch-icon" href="\/favicon\.svg" \/>\n/g, '');

// Add to metadata
const metadataStr = `    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' }
        ],
        apple: [
            { url: '/favicon.svg', type: 'image/svg+xml' }
        ]
    },`;

// Replace the comment about removing icons
file = file.replace(/\/\/ removed next\.js icons metadata in favor of standard link tags/g, metadataStr);

fs.writeFileSync('app/layout.tsx', file, 'utf8');
console.log('Fixed metadata icons');
