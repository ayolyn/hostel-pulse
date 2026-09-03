const fs = require('fs');

let file = 'app/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/actions.ts';
let content = fs.readFileSync(file, 'utf-8');

// Update revokeVerification
let revokeRegex = /await createNotification\(id, 'Verification Revoked', 'Your verification status has been revoked\. Please contact support\.', '\/dashboard', 'warning'\);/g;
content = content.replace(revokeRegex, `await createNotification(id, 'Verification Revoked', 'Your verification status has been revoked. Please contact support.', '/dashboard', 'warning');
        
        const { data: profileForEmail } = await db.from('profiles').select('contact_email, email').eq('id', id).single();
        if (profileForEmail) {
            const emailToUse = profileForEmail.contact_email || profileForEmail.email;
            if (emailToUse) {
                const html = getEmailTemplate({
                    subHeading: 'ACCOUNT UPDATE',
                    title: 'Verification Revoked',
                    body: 'Your account verification has been revoked by our compliance team. You may need to re-upload clear and valid documents to regain access to full platform features.',
                    buttonText: 'Update Documents',
                    buttonLink: 'https://hostel-pulse.pages.dev/dashboard/agent',
                    showFallbackLink: false
                });
                await sendNotificationEmail(emailToUse, 'Action Required: Verification Revoked', html);
            }
        }`);

fs.writeFileSync(file, content, 'utf-8');
console.log("Updated revokeVerification in admin actions");
