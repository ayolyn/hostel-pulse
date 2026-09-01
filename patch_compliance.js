const fs = require('fs');
let file = 'components/dashboard/CompliancePortal.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Fix disabled logic on step 1 (business)
content = content.replace(
    /disabled=\{loading \|\| \(currentStep === 0 && \(!formData.full_name \|\| !formData.phone\)\) \|\| \(currentStep === 2 && \(!formData.bank_name \|\| !formData.account_number\)\) \|\| \(currentStep === 3 && \(!files.govt_id \|\| !files.selfie\)\)\}/g,
    'disabled={loading || (currentStep === 0 && (!formData.full_name || !formData.phone)) || (currentStep === 1 && !formData.office_address) || (currentStep === 2 && (!formData.bank_name || !formData.account_number)) || (currentStep === 3 && (!files.govt_id || !files.selfie))}'
);

// Add "Skip for now" to footer next to back button
content = content.replace(
    /<ChevronLeft className="w-4 h-4" \/> Back\s*<\/button>/,
    `<ChevronLeft className="w-4 h-4" /> Back\n                    </button>\n                    <button onClick={() => window.location.reload()} className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white underline decoration-dashed underline-offset-4 ml-4">Skip for now</button>`
);

// Add 24-48 hours toaster message
content = content.replace(
    /toast\.success\('Compliance documents submitted successfully!'\);/g,
    `toast.success('Documents submitted! Verification takes 24-48 hours. We will notify you via email when approved.', { duration: 5000 });`
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Patched CompliancePortal.tsx");

