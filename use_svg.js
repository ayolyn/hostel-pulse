const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

file = file.replace(/href="\/favicon\.png"/g, 'href="/favicon.svg"');

fs.writeFileSync('app/layout.tsx', file, 'utf8');
console.log('Updated layout to use favicon.svg');
