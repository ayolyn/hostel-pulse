const fs = require('fs');

const files = [
    'app/area-guide/page.tsx',
    'app/calculator/page.tsx',
    'app/providers/page.tsx',
    'app/sell/page.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/<Footer \/>/g, '');
    fs.writeFileSync(file, content, 'utf-8');
});

console.log("Removed duplicated footers");
