const fs = require('fs');
let file = fs.readFileSync('app/market/page.tsx', 'utf8');

file = file.replace("export const runtime = 'edge';", "export const runtime = 'edge';\nexport const dynamic = 'force-dynamic';");

fs.writeFileSync('app/market/page.tsx', file, 'utf8');
