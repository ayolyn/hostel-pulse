const fs = require('fs');
let content = Buffer.from(fs.readFileSync('old_ec52b18_roommates.tsx', 'utf16le')).toString('utf8');
console.log(content.substring(0, 1000));
