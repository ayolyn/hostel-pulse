const fs = require('fs');
let layout = fs.readFileSync('app/layout.tsx', 'utf8');

layout = layout.replace(
    "icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.ico' }",
    "icons: { icon: '/logo-icon.png', shortcut: '/logo-icon.png', apple: '/logo-icon.png' }"
);

fs.writeFileSync('app/layout.tsx', layout);
console.log('Updated layout.tsx icons');
