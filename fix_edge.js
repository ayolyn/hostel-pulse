const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');
if (!content.includes('runtime = \'edge\'')) {
    content = "export const runtime = 'edge';\n" + content;
    fs.writeFileSync('app/page.tsx', content, 'utf8');
    console.log('Added edge runtime to page.tsx');
}
