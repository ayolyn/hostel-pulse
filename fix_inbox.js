const fs = require('fs');
let content = fs.readFileSync('components/messages/MessageList.tsx', 'utf8');

// Fix Personal Notes size
content = content.replace(
    /className="bg-\[#BEF264\]\/10 dark:bg-\[#BEF264\]\/5 p-6 rounded-\[2rem\] border-2 border-dashed border-\[#BEF264\]\/30 hover:border-\[#BEF264\] transition-all flex items-center gap-6 group"/,
    'className="bg-[#BEF264]/10 dark:bg-[#BEF264]/5 p-4 rounded-2xl border-2 border-dashed border-[#BEF264]/30 hover:border-[#BEF264] transition-all flex items-center gap-4 group"'
);
content = content.replace(
    /<div className="w-14 h-14 bg-\[#BEF264\] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-\[#BEF264\]\/20 group-hover:scale-110 transition-transform">/,
    '<div className="w-12 h-12 bg-[#BEF264] rounded-xl flex shrink-0 items-center justify-center text-black shadow-lg shadow-[#BEF264]/20 group-hover:scale-105 transition-transform">'
);
content = content.replace(
    /<MessageSquare className="w-6 h-6" \/>/,
    '<MessageSquare className="w-5 h-5" />'
);

// Fix Chat Items size
content = content.replace(
    /className="bg-white dark:bg-neutral-900 p-6 rounded-\[2rem\] border border-gray-100 dark:border-white\/5 flex items-center gap-6 hover:shadow-xl hover:border-\[#BEF264\]\/30 transition-all group"/g,
    'className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-4 hover:shadow-md hover:border-[#BEF264]/30 transition-all group"'
);
content = content.replace(
    /<div className="w-14 h-14 bg-\[#BEF264\]\/10 dark:bg-\[#BEF264\]\/5 rounded-full flex items-center justify-center text-\[#BEF264\] overflow-hidden relative shrink-0">/g,
    '<div className="w-12 h-12 bg-[#BEF264]/10 dark:bg-[#BEF264]/5 rounded-full flex items-center justify-center text-[#BEF264] overflow-hidden relative shrink-0">'
);
content = content.replace(
    /<User className="w-6 h-6" \/>/g,
    '<User className="w-5 h-5" />'
);

// Fix Top Navigation Tabs (UNIFIED INBOX, HOUSING, COMMUNITY)
content = content.replace(
    /className="flex gap-2 p-2 bg-white dark:bg-neutral-900 rounded-full border border-gray-100 dark:border-white\/5"/,
    'className="flex gap-1 p-1 bg-white dark:bg-neutral-900 rounded-full border border-gray-100 dark:border-white/5"'
);
content = content.replace(
    /className={`flex-1 py-3 px-6 rounded-full text-xs font-black uppercase tracking-widest transition-all \${/g,
    'className={`flex-1 py-2 px-3 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${'
);

fs.writeFileSync('components/messages/MessageList.tsx', content, 'utf8');
console.log("Fixed MessageList sizes");
