const fs = require('fs');

const path = 'c:/Users/USER/Documents/hostelio-app/components/dashboard/InspectionsTab.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file has a lot of dark mode classes: text-white, bg-white/5, border-white/5, bg-black/40
// We need to support light mode by adding `dark:` prefixes and standard gray classes.

content = content.replace(/className="h-48 bg-white\/5 rounded-\[2\.5rem\] border border-white\/5"/g, 'className="h-48 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5"');

content = content.replace(/className="w-32 h-32 bg-white\/5 rounded-\[3rem\] flex items-center justify-center mb-10 border border-white\/5"/g, 'className="w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-[3rem] flex items-center justify-center mb-10 border border-gray-100 dark:border-white/5"');

content = content.replace(/<Calendar className="w-16 h-16 text-white\/5" \/>/g, '<Calendar className="w-16 h-16 text-gray-200 dark:text-white/5" />');

content = content.replace(/<h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">/g, '<h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">');

content = content.replace(/<h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">/g, '<h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">');

content = content.replace(/bg-white\/5 border border-white\/10 rounded-\[2\.5rem\] p-8 flex flex-col md:flex-row gap-8 transition-all hover:bg-white\/\[0\.07\]/g, 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 transition-all hover:border-[#BEF264]/30 hover:shadow-md');

content = content.replace(/<h3 className="text-xl font-black text-white uppercase tracking-tight">/g, '<h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">');

content = content.replace(/border-t border-white\/5/g, 'border-t border-gray-100 dark:border-white/5');

content = content.replace(/text-gray-400 text-xs font-bold uppercase tracking-widest/g, 'text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest');

content = content.replace(/bg-black\/40 rounded-3xl p-4 border border-white\/5/g, 'bg-gray-50 dark:bg-black/40 rounded-3xl p-4 border border-gray-100 dark:border-white/5');

content = content.replace(/text-\[11px\] font-black uppercase tracking-widest text-neutral-400 mb-1/g, 'text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400 mb-1');

content = content.replace(/text-sm font-bold text-white leading-tight/g, 'text-sm font-bold text-gray-900 dark:text-white leading-tight');

content = content.replace(/bg-white\/5 text-red-500 font-black py-4 rounded-2xl uppercase tracking-widest text-\[10px\] hover:bg-red-500\/10/g, 'bg-red-50 dark:bg-white/5 text-red-500 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-red-100 dark:hover:bg-red-500/10');

// Replace green buttons using #BEF264 on white/5
content = content.replace(/bg-white\/5 text-\[#BEF264\] font-black py-4 rounded-2xl uppercase tracking-widest text-\[10px\] hover:bg-\[#BEF264\]\/10/g, 'bg-gray-100 dark:bg-white/5 text-emerald-600 dark:text-[#BEF264] font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-gray-200 dark:hover:bg-[#BEF264]/10');

// Modals
content = content.replace(/bg-neutral-900 rounded-\[3rem\] border border-white\/10 p-10 relative shadow-3xl space-y-4/g, 'bg-white dark:bg-neutral-900 rounded-[3rem] border border-gray-100 dark:border-white/10 p-10 relative shadow-2xl space-y-4');

content = content.replace(/text-xl font-black text-white uppercase/g, 'text-xl font-black text-gray-900 dark:text-white uppercase');

content = content.replace(/bg-white\/5 p-4 rounded-xl/g, 'bg-gray-50 dark:bg-white/5 p-4 rounded-xl');

content = content.replace(/font-bold text-white/g, 'font-bold text-gray-900 dark:text-white');

content = content.replace(/font-bold flex items-center gap-2 text-white/g, 'font-bold flex items-center gap-2 text-gray-900 dark:text-white');

content = content.replace(/font-bold flex items-center justify-between text-white/g, 'font-bold flex items-center justify-between text-gray-900 dark:text-white');

content = content.replace(/bg-white\/10 rounded-full text-\[10px\] font-black uppercase tracking-widest/g, 'bg-gray-200 dark:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white');

content = content.replace(/text-gray-500 hover:text-white/g, 'text-gray-500 hover:text-gray-900 dark:hover:text-white');

// Handshake
content = content.replace(/bg-white\/5 border border-\[#BEF264\]\/20 rounded-\[2\.5rem\] p-8 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-white\/5 to-\[#BEF264\]\/5/g, 'bg-white dark:bg-white/5 border border-emerald-200 dark:border-[#BEF264]/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-emerald-50 dark:from-white/5 to-emerald-100/50 dark:to-[#BEF264]/5 shadow-sm');

content = content.replace(/text-xl font-black text-white uppercase tracking-tight italic/g, 'text-xl font-black text-emerald-800 dark:text-white uppercase tracking-tight italic');

content = content.replace(/Student: <span className="text-white">/g, 'Student: <span className="text-emerald-900 dark:text-white">');

content = content.replace(/text-\[9px\] font-black uppercase tracking-widest text-gray-600 ml-2/g, 'text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-gray-600 ml-2');

content = content.replace(/bg-neutral-900 rounded-\[3rem\] border border-white\/10 p-10 text-center relative shadow-3xl/g, 'bg-white dark:bg-neutral-900 rounded-[3rem] border border-gray-100 dark:border-white/10 p-10 text-center relative shadow-2xl');

content = content.replace(/border-8 border-white\/5/g, 'border-8 border-gray-50 dark:border-white/5');

content = content.replace(/text-xs font-bold text-white uppercase tracking-widest/g, 'text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest');

content = content.replace(/text-\[9px\] font-black uppercase tracking-widest text-\[#BEF264\] mt-1/g, 'text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-[#BEF264] mt-1');


fs.writeFileSync(path, content, 'utf8');
console.log("Replaced colors.");
