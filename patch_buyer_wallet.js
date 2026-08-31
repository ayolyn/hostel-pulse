const fs = require('fs');
let content = fs.readFileSync('components/dashboard/BuyerWalletTab.tsx', 'utf-8');

// Replace "Pending Admin Approval" with just "Pending" or "Processing"
content = content.replace(
    /t\.status === 'pending' \|\| t\.status === 'Pending' \? 'Pending Admin Approval' : t\.status/g,
    "t.status === 'pending' || t.status === 'Pending' ? 'Processing' : t.status"
);

fs.writeFileSync('components/dashboard/BuyerWalletTab.tsx', content, 'utf-8');
console.log("Patched BuyerWalletTab.tsx");
