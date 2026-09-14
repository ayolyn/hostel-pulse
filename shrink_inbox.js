const fs = require('fs');
let content = fs.readFileSync('components/messages/MessageList.tsx', 'utf8');

// Container
content = content.replace('grid grid-cols-1 gap-4', 'flex flex-col gap-1.5');
content = content.replace('flex flex-col gap-6', 'flex flex-col gap-4');

// Personal Notes Action Box
content = content.replace('p-4 rounded-2xl border-2', 'p-3 rounded-xl border border-dashed');
content = content.replace('w-12 h-12 bg-[#BEF264]', 'w-10 h-10 bg-[#BEF264]');
content = content.replace('w-5 h-5', 'w-4 h-4');
content = content.replace('font-black text-gray-900 dark:text-white uppercase tracking-tight">Personal Notes', 'font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">Personal Notes');

// Individual Chats
content = content.replace(/p-4 rounded-2xl border border-gray-100 dark:border-white\/5/g, 'px-4 py-2.5 rounded-xl border border-transparent hover:bg-gray-50 dark:hover:bg-neutral-900/50');
content = content.replace(/w-12 h-12/g, 'w-11 h-11'); // A bit smaller avatars
content = content.replace(/mb-1/g, 'mb-0');
content = content.replace(/<h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">/g, '<h3 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[200px]">');
content = content.replace(/uppercase tracking-tight truncate/g, 'truncate'); // If it still matched something else
content = content.replace(/<p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">/g, '<p className="text-[13px] text-gray-500 dark:text-gray-400 truncate max-w-[250px] font-normal leading-tight">');
content = content.replace(/<div className="flex items-center gap-1 text-\[10px\] text-gray-400 font-bold uppercase tracking-widest pt-1">/g, '<div className="flex items-center gap-1 text-[11px] text-gray-400 font-normal pt-0.5">');
content = content.replace(/pt-1/g, 'pt-0');

fs.writeFileSync('components/messages/MessageList.tsx', content, 'utf8');
