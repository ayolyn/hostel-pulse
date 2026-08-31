const fs = require('fs');
let content = fs.readFileSync('next.config.mjs', 'utf-8');

content = content.replace(/source: '\/\(\.\*\)'/g, "source: '/:path*'");

fs.writeFileSync('next.config.mjs', content, 'utf-8');
console.log("Patched next.config.mjs");
