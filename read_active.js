const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');
console.log(content.substring(content.indexOf('const isActive'), content.indexOf('const activeIndex')));
