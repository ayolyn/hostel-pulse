const fs = require('fs');
let file = 'components/dashboard/DetailedProfileForm.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Replace the Verified Document hardcoded text
content = content.replace(
    /<p className="text-xs font-black uppercase tracking-widest text-\[#BEF264\] drop-shadow-md">Verified Document<\/p>/g,
    `<p className="text-xs font-black uppercase tracking-widest text-[#BEF264] drop-shadow-md">{account?.is_approved ? 'Verified' : 'Pending Review'}</p>`
);

// We need to also change the green checkmark if it's pending review. 
content = content.replace(
    /bg-\[#BEF264\] rounded-full flex items-center justify-center mb-2 shadow-lg shadow-\[#BEF264\]\/30/g,
    `\${account?.is_approved ? 'bg-[#BEF264] shadow-[#BEF264]/30' : 'bg-amber-500 shadow-amber-500/30'} rounded-full flex items-center justify-center mb-2 shadow-lg`
);
// It was className="w-14 h-14 bg-[#BEF264]...
// so let's just do a proper replace.
content = content.replace(
    /<div className="w-14 h-14 bg-\[#BEF264\] rounded-full flex items-center justify-center mb-2 shadow-lg shadow-\[#BEF264\]\/30">/g,
    `<div className={\`w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-lg \${account?.is_approved ? 'bg-[#BEF264] shadow-[#BEF264]/30' : 'bg-amber-400 shadow-amber-400/30'}\`}>`
);
content = content.replace(
    /<p className="text-xs font-black uppercase tracking-widest text-\[#BEF264\] drop-shadow-md">\{account\?\.is_approved \? 'Verified' : 'Pending Review'\}<\/p>/g,
    `<p className={\`text-[10px] font-black uppercase tracking-widest drop-shadow-md \${account?.is_approved ? 'text-[#BEF264]' : 'text-amber-400'}\`}>{account?.is_approved ? 'Verified Document' : 'Pending Review'}</p>`
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Patched DetailedProfileForm colors");
