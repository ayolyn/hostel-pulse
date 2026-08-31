const fs = require('fs');
let content = fs.readFileSync('components/dashboard/DetailedProfileForm.tsx', 'utf-8');

const target = `                    await supabase.from('profiles').update({ 
                        full_name: updates.contact_name, 
                        avatar_url: updates.logo_url || formData.logo_url,
                        department: updates.department, 
                        level: updates.level, 
                        student_id_url: updates.student_id_url || formData.student_id_url,
                        dob: updates.dob,
                        contact_email: updates.contact_email
                    }).eq('id', userId);`;

const replacement = `                    await supabase.from('profiles').update({ 
                        full_name: updates.contact_name, 
                        avatar_url: updates.logo_url || formData.logo_url,
                        department: updates.department, 
                        level: updates.level, 
                        student_id_url: updates.student_id_url || formData.student_id_url,
                        dob: updates.dob,
                        contact_email: updates.contact_email
                    }).eq('id', userId);

                    // Trigger AI Verification in the background if a new ID was uploaded
                    if (updates.student_id_url) {
                        toast.loading("Analyzing student ID...", { id: 'ai-verification' });
                        verifyStudentIdAuto(userId, updates.student_id_url).then(res => {
                            if (res.success && res.approved) {
                                toast.success("ID Verified! You have been approved.", { id: 'ai-verification' });
                                if (onSuccess) onSuccess(); // Reload data
                            } else if (res.success && !res.approved) {
                                toast.error("Could not auto-verify. Flagged for Admin review.", { id: 'ai-verification' });
                            } else {
                                toast.dismiss('ai-verification');
                            }
                        });
                    }`;

if (content.includes("verifyStudentIdAuto")) {
    if (content.includes("updates.student_id_url || formData.student_id_url")) {
        // Need to find the exact match block. Wait, let's just use regex.
        content = content.replace(
            /await supabase\.from\('profiles'\)\.update\(\{\s*full_name: updates\.contact_name,\s*avatar_url: updates\.logo_url \|\| formData\.logo_url,\s*department: updates\.department,\s*level: updates\.level,\s*student_id_url: updates\.student_id_url \|\| formData\.student_id_url,\s*dob: updates\.dob,\s*contact_email: updates\.contact_email\s*\}\)\.eq\('id', userId\);/g,
            replacement
        );
        fs.writeFileSync('components/dashboard/DetailedProfileForm.tsx', content, 'utf-8');
        console.log("Patched DetailedProfileForm.tsx successfully!");
    }
}
