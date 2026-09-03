const fs = require('fs');
let file = 'app/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/actions.ts';
let content = fs.readFileSync(file, 'utf-8');

// Update approveAccount
let approveRegex = /await createNotification\(id, 'Account Approved! [^']+', 'Your professional account has been verified\. You can now list properties\.', roleMap\[tableName\] \|\| '\/dashboard', 'account_approved'\);/g;
content = content.replace(approveRegex, `await createNotification(id, 'Account Approved! ??', 'Your professional account has been verified. You can now list properties.', roleMap[tableName] || '/dashboard', 'account_approved');
    
    const { data: profileForEmail } = await db.from('profiles').select('contact_email, email').eq('id', id).single();
    if (profileForEmail) {
        const emailToUse = profileForEmail.contact_email || profileForEmail.email;
        if (emailToUse) {
            const html = getEmailTemplate({
                subHeading: 'COMPLIANCE UPDATE',
                title: 'Account Approved! ??',
                body: 'Great news! Your professional account has been verified by our compliance team. You now have full access to list properties and manage your dashboard.',
                buttonText: 'Go to Dashboard',
                buttonLink: 'https://hostel-pulse.pages.dev/dashboard/agent',
                showFallbackLink: false
            });
            await sendNotificationEmail(emailToUse, 'Hostel Pulse: Account Approved!', html);
        }
    }`);

// Update rejectAccount
let rejectRegex = /await db\.from\('messages_queue'\)\.insert\(\{\s*user_id: id,\s*subject: 'Verification Failed',\s*message: 'Your document verification failed\.'\s*\}\);/g;
content = content.replace(rejectRegex, `await db.from('messages_queue').insert({
                user_id: id,
                subject: 'Verification Failed',
                message: 'Your document verification failed.'
            });

            if (authUser?.email) {
                const html = getEmailTemplate({
                    subHeading: 'COMPLIANCE UPDATE',
                    title: 'Verification Rejected',
                    body: 'Unfortunately, your compliance documents were rejected. Please log into your dashboard and upload clear, valid copies of your IDs.',
                    buttonText: 'Upload Documents',
                    buttonLink: 'https://hostel-pulse.pages.dev/dashboard/student',
                    showFallbackLink: false
                });
                await sendNotificationEmail(authUser.email, 'Hostel Pulse: Verification Rejected', html);
            }`);

fs.writeFileSync(file, content, 'utf-8');
console.log("Updated approve/reject in admin actions");
