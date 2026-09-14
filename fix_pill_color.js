const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

content = content.replace('stroke="#EF4444"', 'stroke="#BEF264"');

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
