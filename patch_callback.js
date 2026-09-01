const fs = require('fs');
let file = 'app/auth/callback/route.ts';
let content = fs.readFileSync(file, 'utf-8');

// Insert a notification when creating a new profile
content = content.replace(
    /await supabase\.from\('profiles'\)\.insert\(\{([\s\S]*?)\}\);/g,
    `await supabase.from('profiles').insert({$1});
                
                // Send onboarding system notification
                await supabase.from('notifications').insert({
                    user_id: data.user.id,
                    title: 'Welcome to Hostel Pulse! ??',
                    message: 'Hey babe! Welcome to the coolest housing platform in Ogbomoso. Make sure to complete your profile to get started!',
                    type: 'system',
                    is_read: false
                });`
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Patched auth callback");
