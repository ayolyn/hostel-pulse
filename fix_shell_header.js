const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

const targetHeader = `<header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-white/10 px-6 py-3 flex items-center justify-between">`;
const replaceHeader = `<header className="fixed top-4 left-4 right-4 md:left-8 md:right-8 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-6xl z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-neutral-200 dark:border-white/10 px-4 py-2.5 md:py-3 rounded-full flex items-center justify-between shadow-sm">`;
content = content.replace(targetHeader, replaceHeader);

const targetNav = `<nav className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-neutral-200 dark:border-white/10 p-1 rounded-full ml-6">`;
const replaceNav = `<nav className="hidden lg:flex items-center gap-2 ml-auto mr-auto absolute left-1/2 -translate-x-1/2">`;
content = content.replace(targetNav, replaceNav);

content = content.replace(
    "className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isActive(item.name) ? 'bg-black dark:bg-[#BEF264] text-white dark:text-black shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'}`}",
    "className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isActive(item.name) ? 'text-[#10b981] dark:text-[#34d399]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}"
);

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
console.log("Fixed shell header");
