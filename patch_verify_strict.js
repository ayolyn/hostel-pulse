const fs = require('fs');
let content = fs.readFileSync('app/actions/verification.ts', 'utf-8');

const newPrompt = `Analyze this image strictly. Is it a valid, official student ID card for LAUTECH (Ladoke Akintola University of Technology)? You must find the university name "Ladoke Akintola University of Technology" or "LAUTECH" clearly visible, along with a student photo. If ANY of these are missing, or if it is a random image, reply with exactly 'NO'. Only reply 'YES' if it is unmistakably a LAUTECH student ID.`;

content = content.replace(/Analyze this image\. Is it a valid student ID card for LAUTECH.*?NO' if it is not\./, newPrompt);

// Also add logic to update all profile types, just in case
content = content.replace(/await supabaseAdmin\.from\('student_accounts'\)\.update\(\{ is_approved: true \}\)\.eq\('id', userId\);/, `await supabaseAdmin.from('student_accounts').update({ is_approved: true }).eq('id', userId);
            await supabaseAdmin.from('agent_accounts').update({ is_approved: true }).eq('id', userId);
            await supabaseAdmin.from('landlord_accounts').update({ is_approved: true }).eq('id', userId);`);

fs.writeFileSync('app/actions/verification.ts', content, 'utf-8');
console.log("Patched verification");
