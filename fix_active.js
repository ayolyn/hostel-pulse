const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

const activeLogic = `if (name === 'MAP') {
            return pathname.startsWith('/explore');
        }
        if (name === 'ROOMMATES') {
            return pathname.startsWith('/roommates');
        }`;

content = content.replace("if (name === 'SEARCH') {", activeLogic + "\n        if (name === 'SEARCH') {");

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
