const fs = require('fs');
let content = fs.readFileSync('components/layout/PublicHeader.tsx', 'utf8');

// Replace the Area Guides link
content = content.replace(
    "{ name: 'Area Guides', href: '/area-guide' }",
    "{ name: 'Area Guides', href: 'https://lautech.xyz/' }"
);

// If there's an issue with Link for external URLs in this specific Next.js version, it's safer to use an <a> tag or target="_blank", but let's check how it's mapped.
content = content.replace(
    /href=\{link\.href\}/,
    'href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}'
);

fs.writeFileSync('components/layout/PublicHeader.tsx', content);
console.log('Fixed PublicHeader.tsx');
