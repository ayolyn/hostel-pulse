const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf-8');

const target = `{accountData?.is_approved ? 'Full Platform Access' : 'Action Required in Profile'}`;
const replacement = `{accountData?.is_approved ? 'Full Platform Access' : 'Upload your University ID & complete your profile to unlock access.'}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('app/dashboard/student/page.tsx', content, 'utf-8');
    console.log("Updated instructions in student page");
}
