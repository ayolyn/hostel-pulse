const fs = require('fs');
let content = fs.readFileSync('old_shell.tsx', 'utf16le');
let utf8 = Buffer.from(content).toString('utf8');
console.log(utf8.substring(utf8.indexOf('bottom-0') - 200, utf8.indexOf('bottom-0') + 1000));
