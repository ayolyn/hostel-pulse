const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Remove the local Edit3 declaration
content = content.replace(/const Edit3 = \(\{ className \}: \{ className\?: string \}\) => \([\s\S]*?\);\n/g, '');

fs.writeFileSync('app/page.tsx', content);
console.log('Fixed Edit3 conflict');
