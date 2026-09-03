const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');

if (!content.includes('metadataBase:')) {
    content = content.replace(
        'export const metadata: Metadata = {',
        'export const metadata: Metadata = {\n    metadataBase: new URL("https://hostelpulse.com.ng"),'
    );
    fs.writeFileSync('app/layout.tsx', content);
    console.log('Added metadataBase to layout.tsx');
}
