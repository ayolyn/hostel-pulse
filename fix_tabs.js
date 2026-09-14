const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf8');

const target = `        } else if (tab === 'messages') {
            setActiveTab('Messages');
        } else {
            setActiveTab('Overview');
        }`;

const replacement = `        } else if (tab === 'messages') {
            setActiveTab('Messages');
        } else if (tab === 'gigs') {
            setActiveTab('Gigs');
        } else if (tab === 'wallet') {
            setActiveTab('Wallet');
        } else {
            setActiveTab('Overview');
        }`;

content = content.replace(target, replacement);
fs.writeFileSync('app/dashboard/student/page.tsx', content, 'utf8');
console.log("Fixed tab routing");
