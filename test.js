const fs = require('fs');

let content = fs.readFileSync('components/dashboard/DetailedProfileForm.tsx', 'utf-8');

// Replace "Verified Document" with conditional check
content = content.replace(
    /<span className="text-xs font-black tracking-tight">Verified Document<\/span>/g,
    `<span className="text-[10px] font-black uppercase tracking-widest">{account?.is_approved ? 'Verified Document' : 'Pending Review'}</span>`
);

// We need to do this carefully. Let's find exactly where "Verified Document" is used in DetailedProfileForm.
