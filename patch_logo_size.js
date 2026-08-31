const fs = require('fs');
const files = [
    'components/layout/PublicHeader.tsx',
    'components/layout/StudentHeader.tsx',
    'components/layout/AgentHeader.tsx',
    'components/layout/LandlordHeader.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf-8');
        content = content.replace(/className="h-8 w-auto/g, 'className="h-6 w-auto');
        fs.writeFileSync(file, content, 'utf-8');
        console.log(`Updated ${file}`);
    }
});
