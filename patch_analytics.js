const fs = require('fs');

const files = [
    'components/dashboard/AnalyticsTab.tsx',
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    content = content.replace(/gap-8/g, 'gap-4');
    content = content.replace(/p-8/g, 'p-4 md:p-5');

    fs.writeFileSync(file, content, 'utf-8');
    console.log("Patched", file);
});
