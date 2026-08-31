const fs = require('fs');
let content = fs.readFileSync('lib/notifications.ts', 'utf-8');

// Update emailTriggerTypes
content = content.replace(
    /const emailTriggerTypes = \[.*?\];/s,
    `const emailTriggerTypes = [
            'VERIFICATION_SUCCESS', 'account_approved', 
            'VERIFICATION_FAILED', 'account_rejected', 
            'dispute_resolved', 'warning', 'account_suspended', 
            'account_banned', 'inspection', 'booking', 'booking_requested', 'booking_success'
        ];`
);

// Update how it fetches the email
content = content.replace(
    /const \{ data: profile \} = await supabaseAdmin\.from\('profiles'\)\.select\('contact_email'\)\.eq\('id', userId\)\.single\(\);\s*if \(profile\?\.contact_email\) \{/,
    `let userEmail = '';
            const { data: profile } = await supabaseAdmin.from('profiles').select('contact_email').eq('id', userId).single();
            if (profile?.contact_email) {
                userEmail = profile.contact_email;
            } else {
                const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
                if (authData?.user?.email) {
                    userEmail = authData.user.email;
                }
            }

            if (userEmail) {`
);

content = content.replace(
    /await sendNotificationEmail\(profile\.contact_email, title, html\);/,
    `await sendNotificationEmail(userEmail, title, html);`
);

fs.writeFileSync('lib/notifications.ts', content, 'utf-8');
console.log("Updated lib/notifications.ts");
