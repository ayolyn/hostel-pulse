const fs = require('fs');
let file = fs.readFileSync('app/join/page.tsx', 'utf8');

if (!file.includes('import { useEffect }')) {
    if (file.includes(`import { useSearchParams }`)) {
        file = file.replace(`import { useSearchParams }`, `import { useSearchParams } from 'next/navigation';\nimport { useEffect } from 'react';`);
    } else {
        file = `import { useEffect } from 'react';\n` + file;
    }
    fs.writeFileSync('app/join/page.tsx', file, 'utf8');
}
console.log('Fixed useEffect in join/page.tsx');
