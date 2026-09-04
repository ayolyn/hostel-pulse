const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

file = file.replace(
    `icons: { icon: '/logo-icon.png', shortcut: '/logo-icon.png', apple: '/logo-icon.png' },`,
    `icons: { icon: '/logo-icon.png?v=2', shortcut: '/logo-icon.png?v=2', apple: '/logo-icon.png?v=2' },`
);

fs.writeFileSync('app/layout.tsx', file, 'utf8');
console.log('Fixed favicon versioning');
