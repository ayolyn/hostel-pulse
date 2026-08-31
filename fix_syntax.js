const fs = require('fs');
let content = fs.readFileSync('app/actions/verification.ts', 'utf-8');

// replace the double quotes with single quotes inside the text string
content = content.replace(
    /"Ladoke Akintola University of Technology" or "LAUTECH"/g,
    "'Ladoke Akintola University of Technology' or 'LAUTECH'"
);

fs.writeFileSync('app/actions/verification.ts', content, 'utf-8');
console.log("Fixed syntax error");
