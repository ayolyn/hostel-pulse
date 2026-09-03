const fs = require('fs');
let layout = fs.readFileSync('app/layout.tsx', 'utf8');

// Ensure icons explicitly points to /favicon.ico or remove conflicting ones
// Let's just add it explicitly to the metadata if it's not there, or replace it.
if (layout.includes('icons:')) {
    layout = layout.replace(/icons:\s*\{[^}]+\}/, "icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.ico' }");
} else {
    layout = layout.replace(/export const metadata: Metadata = \{/, "export const metadata: Metadata = {\n  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.ico' },");
}

fs.writeFileSync('app/layout.tsx', layout);
console.log('Favicon metadata added to layout.tsx');
