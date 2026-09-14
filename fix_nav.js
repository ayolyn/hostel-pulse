const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

// The active indicator (the bump above the tab)
const oldIndicator = `<div className="absolute -top-5 w-14 h-14 bg-neutral-950 rounded-full border-t border-x border-[#BEF264]/40" />`;
// Make it a simple top border indicator inside the nav
const newIndicator = `<div className="absolute top-0 w-8 h-[3px] bg-[#BEF264] rounded-b-full shadow-[0_0_10px_#BEF264]" />`;
content = content.replace(oldIndicator, newIndicator);

// The icon positioning (so it doesn't jump out)
const oldIcon = `className={\`w-6 h-6 transition-all duration-300 ease-out absolute \${active ? '-top-3 text-[#BEF264] stroke-[2.5]' : 'top-3.5 text-gray-500 stroke-[2]'}\`}`;
const newIcon = `className={\`w-5 h-5 transition-all duration-300 ease-out absolute \${active ? 'top-3 text-[#BEF264] stroke-[2.5] scale-110' : 'top-3.5 text-gray-500 stroke-[2]'}\`}`;
content = content.replace(oldIcon, newIcon);

// The text size and position
const oldText = `className={\`text-[9px] font-black uppercase tracking-widest transition-all duration-300 absolute \${active ? 'bottom-2.5 text-[#BEF264] opacity-100 translate-y-0' : 'bottom-2 text-gray-500 opacity-80 translate-y-0'}\`}`;
const newText = `className={\`text-[9px] font-black uppercase tracking-widest transition-all duration-300 absolute \${active ? 'bottom-2 text-[#BEF264] opacity-100' : 'bottom-2 text-gray-500 opacity-80'}\`}`;
content = content.replace(oldText, newText);

// Shrink bottom bar height
content = content.replace('h-[72px]', 'h-[64px]');

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
