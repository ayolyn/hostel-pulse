const fs = require('fs');
let content = fs.readFileSync('app/book/[propertyId]/MockCheckoutClient.tsx', 'utf-8');

// 1. Update executePayment method signature and toast
content = content.replace(
    /const executePayment = async \(method: 'WALLET' \| 'CARD'\) => \{/,
    `const executePayment = async (method: 'WALLET' | 'CARD' | 'OPAY') => {`
);

content = content.replace(
    /toast\.loading\(\`Processing payment via \$\{method === 'WALLET' \? 'Wallet' : 'Card'\}\.\.\.\`, \{ id: "payment" \}\);/,
    `toast.loading(\`Processing payment via \${method === 'WALLET' ? 'Wallet' : method === 'OPAY' ? 'OPay' : 'Paystack'}...\`, { id: "payment" });`
);

// 2. Add OPay button
const cardButton = `<button 
                                onClick={() => executePayment('CARD')}
                                disabled={isProcessing}
                                className="w-full bg-black text-[#BEF264] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-neutral-800 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-gray-200 disabled:opacity-50"
                            >
                                {isProcessing ? "Processing..." : (
                                    <>
                                        <CreditCard className="w-5 h-5" /> Pay with Paystack
                                    </>
                                )}
                            </button>`;

const opayButton = `<button 
                                onClick={() => executePayment('OPAY')}
                                disabled={isProcessing}
                                className="w-full bg-[#1dbf73] text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-[#18a061] transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-gray-200 disabled:opacity-50"
                            >
                                {isProcessing ? "Processing..." : (
                                    <>
                                        <Smartphone className="w-5 h-5" /> Pay with OPay
                                    </>
                                )}
                            </button>`;

const newButtons = cardButton + '\n\n                            ' + opayButton;

content = content.replace(
    /<button \s*onClick=\{\(\) => executePayment\('CARD'\)\}\s*disabled=\{isProcessing\}\s*className="w-full bg-black text-\[#BEF264\] font-black uppercase tracking-widest py-4 \s*rounded-2xl hover:bg-neutral-800 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl \s*shadow-gray-200 disabled:opacity-50"\s*>\s*\{isProcessing \? "Processing\.\.\." : \(\s*<>\s*<CreditCard className="w-5 h-5" \/> Pay with Card \(Mock\)\s*<\/>\s*\)\}\s*<\/button>/g,
    newButtons
);

// 3. Import Smartphone
if (content.includes('import { Wallet, CreditCard')) {
    content = content.replace('import { Wallet, CreditCard', 'import { Wallet, CreditCard, Smartphone');
} else {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g, function(match, imports) {
        if (!imports.includes('Smartphone')) {
            return `import { ${imports}, Smartphone } from 'lucide-react'`;
        }
        return match;
    });
}

fs.writeFileSync('app/book/[propertyId]/MockCheckoutClient.tsx', content, 'utf-8');
console.log("Updated MockCheckoutClient with OPay");
