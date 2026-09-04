const fs = require('fs');
let file = fs.readFileSync('components/layout/PublicHeader.tsx', 'utf8');

file = file.replace(
    `import { Menu, X } from 'lucide-react';`,
    `import { Menu, X, ChevronRight } from 'lucide-react';`
);

fs.writeFileSync('components/layout/PublicHeader.tsx', file, 'utf8');
console.log('Added ChevronRight');
