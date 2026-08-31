const fs = require('fs');
let content = fs.readFileSync('components/market/MarketCheckout.tsx', 'utf-8');

// Import Wallet, Smartphone from lucide-react
if (!content.includes('Smartphone')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g, function(match, imports) {
        if (!imports.includes('Smartphone')) {
            return `import { ${imports}, Smartphone, Wallet } from 'lucide-react'`;
        }
        return match;
    });
}

// Add method to handlePurchase
content = content.replace(
    /const handlePurchase = async \(\) => \{/,
    `const handlePurchase = async (method: 'WALLET' | 'CARD' | 'OPAY') => {`
);

content = content.replace(
    /body: JSON\.stringify\(\{ listing_id: item\.id \}\)/,
    `body: JSON.stringify({ listing_id: item.id, method })`
);

const singleButton = `<button 
                            onClick={handlePurchase}
                            disabled={loading}
                            className="w-full bg-black dark:bg-[#BEF264] dark:text-black text-white font-black py-5 rounded-2xl shadow-xl shadow-[#BEF264]/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                        >
                            <CreditCard className="w-5 h-5" />
                            <span className="uppercase tracking-widest text-[11px]">Pay & Secure Item</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>`;

const newButtons = `<div className="space-y-3">
                            <button 
                                onClick={() => handlePurchase('WALLET')}
                                disabled={loading}
                                className="w-full bg-[#BEF264] text-black font-black py-5 rounded-2xl shadow-xl shadow-[#BEF264]/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                            >
                                <Wallet className="w-5 h-5" />
                                <span className="uppercase tracking-widest text-[11px]">Pay from Wallet</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={() => handlePurchase('CARD')}
                                disabled={loading}
                                className="w-full bg-black text-[#BEF264] font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                            >
                                <CreditCard className="w-5 h-5" />
                                <span className="uppercase tracking-widest text-[11px]">Pay with Paystack</span>
                            </button>
                            <button 
                                onClick={() => handlePurchase('OPAY')}
                                disabled={loading}
                                className="w-full bg-[#1dbf73] text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                            >
                                <Smartphone className="w-5 h-5" />
                                <span className="uppercase tracking-widest text-[11px]">Pay with OPay</span>
                            </button>
                        </div>`;

content = content.replace(singleButton, newButtons);

fs.writeFileSync('components/market/MarketCheckout.tsx', content, 'utf-8');
console.log("Updated MarketCheckout.tsx");
