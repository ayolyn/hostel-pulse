const fs = require('fs');
let file = fs.readFileSync('app/blog/page.tsx', 'utf8');

file = "export const runtime = 'edge';\n" + file;

fs.writeFileSync('app/blog/page.tsx', file, 'utf8');
console.log('Added edge runtime back to blog');
