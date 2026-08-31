const fs = require('fs');

function patchModal(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    // Title font size
    content = content.replace(
        /<h3 className="text-2xl font-black/g,
        '<h3 className="text-xl font-black'
    );
    
    // P-8 to p-6
    content = content.replace(
        /<div className="p-8">/g,
        '<div className="p-6">'
    );

    // Button container
    content = content.replace(
        /<div className="flex gap-3 mt-8">/g,
        '<div className="flex flex-col sm:flex-row gap-2 mt-8 flex-wrap">'
    );

    // Button padding/font size
    content = content.replace(
        /py-4 rounded-2xl uppercase tracking-widest text-xs/g,
        'py-3 rounded-xl uppercase tracking-widest text-[10px]'
    );
    
    // specifically for the third button in WalletTab/BuyerWalletTab
    content = content.replace(
        /py-4 rounded-2xl uppercase tracking-widest text-xs hover:/g,
        'py-3 rounded-xl uppercase tracking-widest text-[10px] hover:'
    );

    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
}

patchModal('components/dashboard/BuyerWalletTab.tsx');
patchModal('components/dashboard/WalletTab.tsx');
