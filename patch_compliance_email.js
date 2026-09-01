const fs = require('fs');
let file = 'components/dashboard/CompliancePortal.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('sendComplianceEmail')) {
    content = content.replace(
        /import \{ useRouter \} from 'next\/navigation';/g,
        `import { useRouter } from 'next/navigation';\nimport { sendComplianceEmail } from '@/app/actions/email';`
    );
}

// Add the call to sendComplianceEmail
content = content.replace(
    /toast\.success\('Documents submitted! Verification takes 24-48 hours\. We will notify you via email when approved\.', \{ duration: 5000 \}\);/g,
    `toast.success('Documents submitted! Verification takes 24-48 hours. We will notify you via email when approved.', { duration: 5000 });
            
            // Send email
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                await sendComplianceEmail(user.email, formData.full_name);
            }`
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Patched CompliancePortal to send email");
