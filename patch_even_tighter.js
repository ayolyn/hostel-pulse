const fs = require('fs');

function shrinkEvenFurther(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    // Reduce padding
    content = content.replace(/className="py-3 px-4 hover:bg/g, 'className="py-2 px-3 hover:bg');
    
    // Reduce icons
    content = content.replace(/w-8 h-8 rounded-lg/g, 'w-6 h-6 rounded-md');
    
    // Reduce titles
    content = content.replace(/text-sm font-black text-gray-900/g, 'text-xs font-black text-gray-900');
    
    // Reduce amounts
    content = content.replace(/text-sm font-black tracking-tighter/g, 'text-xs font-black tracking-tighter');
    
    // Reduce subtitles
    content = content.replace(/text-\[10px\] font-black uppercase tracking-widest text-gray-400/g, 'text-[8px] font-bold uppercase tracking-widest text-gray-400');
    content = content.replace(/text-\[10px\] font-black uppercase tracking-widest/g, 'text-[8px] font-black uppercase tracking-widest');
    
    // Gap reduction
    content = content.replace(/gap-4/g, 'gap-2');
    
    fs.writeFileSync(file, content, 'utf-8');
}

shrinkEvenFurther('components/dashboard/BuyerWalletTab.tsx');
shrinkEvenFurther('components/dashboard/WalletTab.tsx');

console.log("Patched even tighter UI");
