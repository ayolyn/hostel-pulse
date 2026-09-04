const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

file = file.replace(
    `icons: { icon: '/logo-icon.png?v=2', shortcut: '/logo-icon.png?v=2', apple: '/logo-icon.png?v=2' },`,
    `// removed next.js icons metadata in favor of standard link tags`
);

fs.writeFileSync('app/layout.tsx', file, 'utf8');
console.log('Removed icons metadata');
