const fs = require('fs');
let content = fs.readFileSync('components/messages/PrivateChat.tsx', 'utf8');

// Fix CustomOfferCard styling
content = content.replace(
    'className="flex justify-center my-6 w-full"',
    'className={`flex ${isMine ? "justify-end" : "justify-start"} my-2 w-full`}'
);
content = content.replace(
    'text-gray-900 dark:text-white p-6 rounded-3xl max-w-sm w-full shadow-lg',
    'text-gray-900 dark:text-white p-3 rounded-2xl max-w-[260px] shadow-sm'
);
content = content.replace(
    '<div className="w-10 h-10 bg-[#BEF264]/10',
    '<div className="w-8 h-8 bg-[#BEF264]/10'
);
content = content.replace(
    '<h4 className="text-sm font-black uppercase tracking-widest"',
    '<h4 className="text-[11px] font-black uppercase tracking-widest"'
);
content = content.replace(
    'bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-4',
    'bg-gray-50 dark:bg-white/5 p-3 rounded-xl mb-3'
);
content = content.replace(
    '<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Base',
    '<span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Base'
);
content = content.replace(
    '<span className="text-sm font-black text-gray-600',
    '<span className="text-xs font-black text-gray-600'
);
content = content.replace(
    'text-lg font-black',
    'text-sm font-black'
);
content = content.replace(
    '<button onClick={() => handleOfferPayment',
    '<button className="bg-[#BEF264] text-black w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-md mt-1" onClick={() => handleOfferPayment'
);
content = content.replace(
    'className="bg-[#BEF264] text-black w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl mt-2"',
    'className="bg-[#BEF264] text-black w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-md mt-1"'
);
content = content.replace(
    'className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-red-50 dark:bg-red-500/10 text-red-500 mt-2"',
    'className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-50 dark:bg-red-500/10 text-red-500 mt-1"'
);
content = content.replace(
    'className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-gray-100 dark:bg-white/5 text-gray-400 mt-2 cursor-not-allowed"',
    'className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-gray-100 dark:bg-white/5 text-gray-400 mt-1 cursor-not-allowed"'
);
content = content.replace(
    'className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mt-2"',
    'className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mt-1"'
);

// Fix normal messages
content = content.replace(
    'p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-xl relative',
    'px-4 py-2 rounded-[1.2rem] text-[13px] font-medium leading-snug shadow-sm relative'
);

// Fix input box size to match whatsapp (smaller padding)
content = content.replace(
    'px-6 py-3 text-sm',
    'px-4 py-2.5 text-[13px]'
);
content = content.replace(
    '<button \n                    type="submit" \n                    disabled={uploading}\n                    className="bg-[#BEF264] p-4 rounded-2xl text-black hover:scale-105 transition-all shadow-lg shadow-[#BEF264]/20 disabled:opacity-50"\n                >',
    '<button \n                    type="submit" \n                    disabled={uploading}\n                    className="bg-[#BEF264] p-3 rounded-2xl text-black hover:scale-105 transition-all shadow-sm disabled:opacity-50"\n                >'
);


fs.writeFileSync('components/messages/PrivateChat.tsx', content, 'utf8');
