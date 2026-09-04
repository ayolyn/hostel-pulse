const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

file = file.replace(
    `export const metadata: Metadata = {
        default: 'HostelPulse | Premium Student Housing in Ogbomoso',
    },`,
    `export const metadata: Metadata = {
    metadataBase: new URL("https://hostelpulse.app"),
    title: {
        template: '%s | HostelPulse',
        default: 'HostelPulse | Premium Student Housing in Ogbomoso',
    },`
);

fs.writeFileSync('app/layout.tsx', file, 'utf8');
console.log('Fixed metadata syntax error');
