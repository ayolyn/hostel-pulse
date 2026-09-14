const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf8');
const regex = /activeTab === '([^']+)'/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[1]);
}
