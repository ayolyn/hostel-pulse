const fs = require('fs');

let file = 'app/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/actions.ts';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes("import { getEmailTemplate } from '@/app/actions/emailTemplates';")) {
    content = content.replace(
        "import { sendNotificationEmail } from '@/lib/email/resend';", 
        "import { sendNotificationEmail } from '@/lib/email/resend';\nimport { getEmailTemplate } from '@/app/actions/emailTemplates';"
    );
}

// Fix Withdrawal Approved
content = content.replace(
    /const html = "<h1>Withdrawal Approved<\/h1><p>Your funds are on the way.<\/p>";/,
    `const html = getEmailTemplate({
                subHeading: 'WALLET UPDATE',
                title: 'Withdrawal Approved',
                body: 'Your funds are on the way to your linked bank account. Please check your bank statement in the next few hours.',
                buttonText: 'View Wallet',
                buttonLink: 'https://hostel-pulse.pages.dev/dashboard/agent?tab=wallet',
                showFallbackLink: false
            });`
);

// Fix Withdrawal Rejected
content = content.replace(
    /const html = "<h1>Withdrawal Rejected<\/h1><p>Your withdrawal request was declined. Please contact support.<\/p>";/,
    `const html = getEmailTemplate({
                subHeading: 'WALLET UPDATE',
                title: 'Withdrawal Rejected',
                body: 'Your recent withdrawal request was declined. Please contact support or verify your bank details before trying again.',
                buttonText: 'Contact Support',
                buttonLink: 'mailto:hello@hostel-pulse.com',
                showFallbackLink: false
            });`
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Updated admin actions");
