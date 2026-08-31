const fs = require('fs');
let content = fs.readFileSync('components/dashboard/DetailedProfileForm.tsx', 'utf-8');

if (!content.includes('verifyStudentIdAuto')) {
    content = content.replace(
        "import { createClient } from '@/lib/supabase/client';",
        "import { createClient } from '@/lib/supabase/client';\nimport { verifyStudentIdAuto } from '@/app/actions/verification';"
    );
}

const findText = `                if (userRole === 'student') {
                    const { error: studentError } = await supabase.from('student_accounts').update({
                        full_name: updates.contact_name,
                        university: updates.university,
                        department: updates.department,
                        level: updates.level,
                        whatsapp_number: updates.whatsapp_number,
                        phone: updates.phone_number,
                        student_id_url: updates.student_id_url || formData.student_id_url,`;

const newText = `                if (userRole === 'student') {
                    const finalStudentIdUrl = updates.student_id_url || formData.student_id_url;
                    const { error: studentError } = await supabase.from('student_accounts').update({
                        full_name: updates.contact_name,
                        university: updates.university,
                        department: updates.department,
                        level: updates.level,
                        whatsapp_number: updates.whatsapp_number,
                        phone: updates.phone_number,
                        student_id_url: finalStudentIdUrl,`;

if (content.includes(findText)) {
    content = content.replace(findText, newText);
    
    // Replace the specific block where it updates profile for student
    const profileText = `                    await supabase.from('profiles').update({ 
                        full_name: updates.contact_name, 
                        avatar_url: updates.logo_url || formData.logo_url,
                        department: updates.department, 
                        level: updates.level, 
                        student_id_url: updates.student_id_url || formData.student_id_url,
                        dob: updates.dob,
                        contact_email: updates.contact_email
                    }).eq('id', userId);`;
                    
    const newProfileText = `                    await supabase.from('profiles').update({ 
                        full_name: updates.contact_name, 
                        avatar_url: updates.logo_url || formData.logo_url,
                        department: updates.department, 
                        level: updates.level, 
                        student_id_url: finalStudentIdUrl,
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

    content = content.replace(profileText, newProfileText);
}

fs.writeFileSync('components/dashboard/DetailedProfileForm.tsx', content, 'utf-8');
console.log("Updated DetailedProfileForm.tsx");
