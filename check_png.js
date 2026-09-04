const fs = require('fs');
const buffer = Buffer.alloc(8);
const fd = fs.openSync('public/logo-icon.png', 'r');
fs.readSync(fd, buffer, 0, 8, 0);
fs.closeSync(fd);
console.log(buffer.toString('hex'));
