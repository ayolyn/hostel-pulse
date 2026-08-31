const fs = require('fs');
let content = fs.readFileSync('components/layout/ConditionalFooter.tsx', 'utf-8');

if (!content.includes("pathname?.startsWith('/book')")) {
    content = content.replace("pathname?.startsWith('/profile');", "pathname?.startsWith('/profile') || pathname?.startsWith('/book');");
    fs.writeFileSync('components/layout/ConditionalFooter.tsx', content, 'utf-8');
    console.log("ConditionalFooter updated to hide on /book");
}
