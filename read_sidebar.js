const fs = require('fs');
let content = Buffer.from(fs.readFileSync('old_sidebar.tsx', 'utf16le')).toString('utf8');
console.log(content.substring(0, 1500));
console.log("\n\n--- BOTTOM ---\n\n");
console.log(content.substring(content.length - 1500, content.length));
