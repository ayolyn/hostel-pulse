const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf8');
console.log(content.substring(content.indexOf('activeTab === \'overview\''), content.indexOf('activeTab === \'overview\'') + 2000));
