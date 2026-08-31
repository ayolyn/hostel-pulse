const fs = require('fs');
let content = fs.readFileSync('components/ui/InspectionModal.tsx', 'utf-8');

// Ensure createNotification is imported
if (!content.includes('createNotification')) {
    content = content.replace("import { createClient } from '@/lib/supabase/client';", "import { createClient } from '@/lib/supabase/client';\nimport { createNotification } from '@/lib/notifications';");
}

// Replace the supabase.from('notifications').insert with createNotification for the agent
const oldAgentInsert = `await supabase.from('notifications').insert({
                    user_id: agentId,
                    title: 'New Inspection Request',
                    message: \`\${user.user_metadata?.full_name || 'A Student'} just requested an inspection for \${date} at \${time}.\`,
                    type: 'inspection'
                });`;

const newNotifications = `// Trigger Notifications for both Agent and Student
                await createNotification(
                    agentId,
                    'New Inspection Request',
                    \`\${user.user_metadata?.full_name || 'A Student'} just requested an inspection for \${date} at \${time}.\`,
                    '/dashboard/agent/inspections',
                    'inspection'
                );

                await createNotification(
                    user.id,
                    'Inspection Requested',
                    \`Your inspection request for \${date} at \${time} has been sent successfully.\`,
                    '/dashboard/student',
                    'inspection'
                );`;

if (content.includes("await supabase.from('notifications').insert({") && content.includes("title: 'New Inspection Request'")) {
    content = content.replace(oldAgentInsert, newNotifications);
    fs.writeFileSync('components/ui/InspectionModal.tsx', content, 'utf-8');
    console.log("Updated InspectionModal.tsx");
} else {
    console.log("Could not find exact match in InspectionModal.tsx");
}
