const fs = require('fs');
let file = 'components/dashboard/CompliancePortal.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Replace the Skip for now button action to set a cookie
content = content.replace(
    /onClick=\{\(\) => window\.location\.reload\(\)\}/g,
    `onClick={() => { document.cookie = 'skip_compliance=true; path=/'; window.location.reload(); }}`
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Patched CompliancePortal to set skip_compliance cookie");
