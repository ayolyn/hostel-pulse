const fs = require('fs');

function shrinkModal(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    // Modal header
    content = content.replace(/w-16 h-16 bg-\[#BEF264\]\/20 rounded-2xl flex items-center justify-center mb-6/g, 'w-12 h-12 bg-[#BEF264]/20 rounded-xl flex items-center justify-center mb-4');
    content = content.replace(/<Receipt className="w-8 h-8 text-\[#BEF264\]" \/>/g, '<Receipt className="w-5 h-5 text-[#BEF264]" />');
    content = content.replace(/text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter/g, 'text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight');
    content = content.replace(/font-medium text-sm mb-8/g, 'font-medium text-xs mb-4');
    
    // Modal rows
    content = content.replace(/py-3 border-b/g, 'py-2 border-b');
    content = content.replace(/text-gray-500 font-bold text-xs uppercase tracking-widest/g, 'text-gray-500 font-bold text-[9px] uppercase tracking-widest');
    content = content.replace(/font-black text-gray-900 dark:text-white/g, 'font-black text-sm text-gray-900 dark:text-white');
    content = content.replace(/font-bold text-gray-700 dark:text-gray-300/g, 'font-bold text-xs text-gray-700 dark:text-gray-300');
    
    // Agent Wallet Tab modal header (it has a slightly different receipt icon style)
    content = content.replace(/w-16 h-16 bg-\[#BEF264\]\/10 rounded-full flex items-center justify-center mx-auto mb-4/g, 'w-12 h-12 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-3');
    content = content.replace(/text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight/g, 'text-base font-black text-gray-900 dark:text-white uppercase tracking-tight');
    content = content.replace(/text-\[10px\] font-bold text-gray-500 mt-1 uppercase/g, 'text-[9px] font-bold text-gray-500 mt-1 uppercase');
    content = content.replace(/text-\[10px\] font-black uppercase tracking-widest text-gray-400/g, 'text-[8px] font-black uppercase tracking-widest text-gray-400');
    
    // Button fonts
    content = content.replace(/text-\[10px\]/g, 'text-[9px]'); // affects some tags, but mostly okay
    
    fs.writeFileSync(file, content, 'utf-8');
}

shrinkModal('components/dashboard/BuyerWalletTab.tsx');
shrinkModal('components/dashboard/WalletTab.tsx');
console.log("Patched Modals");
