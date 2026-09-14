const fs = require('fs');
let content = fs.readFileSync('old_ec52b18_roommates.tsx', 'utf16le');
let utf8 = Buffer.from(content).toString('utf8');
fs.writeFileSync('components/dashboard/RoommatesTab.tsx', utf8, 'utf8');
