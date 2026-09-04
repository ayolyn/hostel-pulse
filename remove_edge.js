const fs = require('fs');
const glob = require('glob');

const staticPages = [
    'app/page.tsx',
    'app/how-it-works/page.tsx',
    'app/safety/page.tsx',
    'app/privacy/page.tsx',
    'app/terms/page.tsx',
    'app/contact/page.tsx',
    'app/calculator/page.tsx',
    'app/explore/page.tsx',
    'app/agent-terms/page.tsx',
    'app/area-guide/page.tsx',
    'app/blog/page.tsx'
];

staticPages.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/export const runtime = 'edge';\r?\n?/g, '');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Removed edge runtime from ${file}`);
    }
});
