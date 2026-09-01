const fs = require('fs');
let file = 'app/auth/callback/route.ts';
let content = fs.readFileSync(file, 'utf-8');

// Insert the email call when creating a new profile
content = content.replace(
    /is_read: false\n                \}\);/g,
    `is_read: false
                });
                
                // Call email action
                if (data.user.email) {
                    try {
                        const emailRes = await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Authorization': \`Bearer \${process.env.RESEND_API_KEY}\`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                from: 'Hostel Pulse <hello@hostel-pulse.com>',
                                to: [data.user.email],
                                subject: 'Welcome to Hostel Pulse! ??',
                                html: \`<h1>Welcome!</h1><p>Hey babe! Welcome to the coolest housing platform in Ogbomoso. Make sure to complete your profile to get started!</p>\`
                            })
                        });
                    } catch(e) {}
                }`
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Patched auth callback with email fetch");
