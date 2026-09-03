const fs = require('fs');

let file = 'app/actions/email.ts';
let content = fs.readFileSync(file, 'utf-8');

// Add import
if (!content.includes('getEmailTemplate')) {
    content = content.replace(/import { Resend } from 'resend';/, `import { Resend } from 'resend';\nimport { getEmailTemplate } from './emailTemplates';`);
}

// Update sendOnboardingEmail
content = content.replace(
    /html: `<h1>Welcome, \$\{name\}!<\/h1><p>Hey babe! Welcome to the coolest housing platform in Ogbomoso. Make sure to complete your profile to get started!<\/p>`/,
    `html: getEmailTemplate({
                subHeading: 'WELCOME TO HOSTEL PULSE',
                title: \`Welcome, \${name}!\`,
                body: 'Hey babe! Welcome to the coolest student housing platform in Ogbomoso.<br><br>Make sure to complete your profile to get started and find your dream hostel.',
                buttonText: 'Complete Profile',
                buttonLink: 'https://hostel-pulse.pages.dev/dashboard/student',
                showFallbackLink: true
            })`
);

// Update sendComplianceEmail
content = content.replace(
    /html: `<h1>Hi \$\{name\},<\/h1><p>Your compliance documents have been submitted successfully. Please allow 24-48 hours for our team to review them. We will notify you once approved!<\/p>`/,
    `html: getEmailTemplate({
                subHeading: 'COMPLIANCE UPDATE',
                title: 'Documents Submitted',
                body: \`Hi \${name},<br><br>Your compliance documents have been submitted successfully. Please allow 24-48 hours for our team to review them. We will notify you once approved.\`,
                buttonText: 'Go to Dashboard',
                buttonLink: 'https://hostel-pulse.pages.dev',
                showFallbackLink: false
            })`
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Updated app/actions/email.ts");
