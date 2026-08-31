const fs = require('fs');

function fix(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    // Fix the weird duplicate text sizes
    content = content.replace(/text-xl font-black text-sm /g, 'text-lg font-black ');
    content = content.replace(/text-lg font-black text-sm /g, 'text-lg font-black ');
    content = content.replace(/text-base font-black text-sm /g, 'text-base font-black ');
    
    fs.writeFileSync(file, content, 'utf-8');
}

fix('components/dashboard/BuyerWalletTab.tsx');
fix('components/dashboard/WalletTab.tsx');

console.log("Fixed artifacts");
