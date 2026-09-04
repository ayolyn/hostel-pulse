const fs = require('fs');
let file = fs.readFileSync('app/join/page.tsx', 'utf8');

file = file.replace("export const runtime = 'edge';\n", "");

fs.writeFileSync('app/join/page.tsx', file, 'utf8');
console.log('Removed edge runtime from client component');
