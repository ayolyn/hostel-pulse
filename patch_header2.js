const fs = require('fs');
let content = fs.readFileSync('components/layout/PublicHeader.tsx', 'utf8');
content = content.replace(
    /href=\{link\.href\}[\s]*className=\{cn\([\s]*"block px-4 py-3 rounded-xl text-base font-medium transition-colors",/g,
    'href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined} className={cn("block px-4 py-3 rounded-xl text-base font-medium transition-colors",'
);
fs.writeFileSync('components/layout/PublicHeader.tsx', content);
