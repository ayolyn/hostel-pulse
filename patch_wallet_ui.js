const fs = require('fs');

const files = [
    'components/dashboard/WalletTab.tsx',
    'components/dashboard/BuyerWalletTab.tsx',
    'components/shared/WalletOverviewCards.tsx',
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    // Wallet Overview Cards
    content = content.replace(/p-8 rounded-\[2\.5rem\]/g, "p-5 rounded-3xl");
    content = content.replace(/text-4xl/g, "text-3xl");
    content = content.replace(/mt-8/g, "mt-4");

    // WalletTab / BuyerWalletTab List items
    content = content.replace(/className="p-6 hover/g, 'className="p-4 hover');
    content = content.replace(/gap-6/g, 'gap-4');
    content = content.replace(/w-12 h-12 rounded-2xl/g, 'w-10 h-10 rounded-xl');
    content = content.replace(/<ArrowUpRight className="w-6 h-6"/g, '<ArrowUpRight className="w-5 h-5"');
    content = content.replace(/<ArrowDownLeft className="w-6 h-6"/g, '<ArrowDownLeft className="w-5 h-5"');
    content = content.replace(/<Wallet className="w-6 h-6"/g, '<Wallet className="w-5 h-5"');
    content = content.replace(/text-lg font-black/g, 'text-base font-black');
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-3xl');

    fs.writeFileSync(file, content, 'utf-8');
    console.log("Patched", file);
});
