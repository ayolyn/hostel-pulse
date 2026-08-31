const fs = require('fs');
const file = 'components/market/MarketCheckout.tsx';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/p-8/g, 'p-5');
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-3xl');
    fs.writeFileSync(file, content, 'utf-8');
    console.log("Patched", file);
}
