const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

file = file.replace(/export const metadata: Metadata = \{\r?\n\s+default: 'HostelPulse \| Premium Student Housing in Ogbomoso',\r?\n\s+\},/g, 
`export const metadata: Metadata = {
    metadataBase: new URL("https://hostelpulse.app"),
    title: {
        template: '%s | HostelPulse',
        default: 'HostelPulse | Premium Student Housing in Ogbomoso',
    },`);

fs.writeFileSync('app/layout.tsx', file, 'utf8');
console.log('Fixed metadata with regex');
