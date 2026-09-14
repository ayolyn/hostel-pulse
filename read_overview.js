const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf8');
console.log(content.substring(content.indexOf(`activeTab === 'Overview'`), content.indexOf(`activeTab === 'Overview'`) + 2000));
