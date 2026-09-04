const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

file = file.replace(
    `<head>`,
    `<head>\n                <link rel="icon" type="image/png" href="/favicon.png" />\n                <link rel="shortcut icon" href="/favicon.png" />\n                <link rel="apple-touch-icon" href="/favicon.png" />`
);

fs.writeFileSync('app/layout.tsx', file, 'utf8');
console.log('Added standard link tags');
