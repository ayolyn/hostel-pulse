const fs = require('fs');

function replaceInFile(filePath, search, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(new RegExp(search, 'g'), replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

replaceInFile('app/sitemap.ts', 'hostelpulse.com.ng', 'hostelpulse.app');
replaceInFile('app/robots.ts', 'hostelpulse.com.ng', 'hostelpulse.app');
replaceInFile('app/layout.tsx', 'hostelpulse.com.ng', 'hostelpulse.app');
