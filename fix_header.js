const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

// Add the hamburger menu to the Top Header for Mobile
const oldHeader = `<div className="flex items-center gap-4">
                    <span className="text-[12px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-3 py-1.5 rounded-full">HP Student</span>`;
const newHeader = `<div className="flex items-center gap-4">
                    <button className="lg:hidden p-2 text-gray-500 hover:text-black dark:hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu w-5 h-5"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg></button>
                    <span className="text-[12px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-3 py-1.5 rounded-full hidden sm:block">HP Student</span>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
