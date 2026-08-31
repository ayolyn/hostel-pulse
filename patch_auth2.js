const fs = require('fs');
let content = fs.readFileSync('app/auth/page.tsx', 'utf-8');

content = content.replace('pr-12 text-white', 'pr-24 text-white');
content = content.replace('className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"', 'className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"');
content = content.replace('className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-[#BEF264] hover:underline"', 'className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-[#BEF264] hover:underline"');

fs.writeFileSync('app/auth/page.tsx', content, 'utf-8');
console.log("Replaced using smaller snippets in app/auth/page.tsx");
