const fs = require('fs');
let file = fs.readFileSync('app/contact/page.tsx', 'utf8');

file = file.replace("support@hostelpulse.app", "info@hostelpulse.app");
file = file.replace("+234 (0) 900 000 0000", "+2348101488169");

fs.writeFileSync('app/contact/page.tsx', file, 'utf8');
