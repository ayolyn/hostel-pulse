const fs = require('fs');
let file = fs.readFileSync('app/rent/page.tsx', 'utf8');
const match = file.match(/price=\{\`([^\$]+)\$\{/);
if (match) {
    console.log("Found corrupted char:", Buffer.from(match[1]).toString('hex'));
    console.log("Raw char:", match[1]);
}
