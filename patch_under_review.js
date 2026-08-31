const fs = require('fs');
let content = fs.readFileSync('components/ui/UnderReview.tsx', 'utf-8');

content = content.replace(
    /Pending Admin Approval/g,
    "Pending Verification"
);

fs.writeFileSync('components/ui/UnderReview.tsx', content, 'utf-8');
console.log("Patched UnderReview.tsx");
