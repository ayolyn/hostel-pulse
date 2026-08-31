const fs = require('fs');
['app/dashboard/agent/page.tsx', 'app/dashboard/landlord/page.tsx'].forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf-8');
        const target = `{accountData?.is_approved ? 'Full Platform Access' : 'Action Required in Profile'}`;
        const replacement = `{accountData?.is_approved ? 'Full Platform Access' : 'Upload your Govt ID & complete your profile to unlock access.'}`;
        if (content.includes(target)) {
            content = content.replace(target, replacement);
            fs.writeFileSync(file, content, 'utf-8');
            console.log(`Updated ${file}`);
        }
    }
});
