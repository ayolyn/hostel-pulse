const fs = require('fs');

function shrink(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    // Wallet items
    content = content.replace(/className="p-4 hover:bg/g, 'className="py-3 px-4 hover:bg');
    content = content.replace(/w-10 h-10 rounded-xl/g, 'w-8 h-8 rounded-lg');
    content = content.replace(/w-5 h-5/g, 'w-4 h-4'); // arrow icons
    content = content.replace(/text-base font-black tracking-tighter/g, 'text-sm font-black tracking-tighter');
    
    fs.writeFileSync(file, content, 'utf-8');
}

shrink('components/dashboard/BuyerWalletTab.tsx');
shrink('components/dashboard/WalletTab.tsx');

function shrinkCards(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    content = content.replace(/text-3xl font-black/g, 'text-2xl sm:text-3xl font-black');
    content = content.replace(/p-5 rounded-3xl/g, 'p-4 rounded-2xl');
    
    fs.writeFileSync(file, content, 'utf-8');
}

shrinkCards('components/shared/WalletOverviewCards.tsx');

console.log("Patched tighter UI");
