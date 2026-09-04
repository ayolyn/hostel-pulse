const fs = require('fs');
let file = fs.readFileSync('app/join/page.tsx', 'utf8');

file = file.replace("import { useEffect } from 'react';\n", "");

fs.writeFileSync('app/join/page.tsx', file, 'utf8');
console.log('Removed extra import');
