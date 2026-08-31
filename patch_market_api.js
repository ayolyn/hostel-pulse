const fs = require('fs');
let content = fs.readFileSync('app/api/market/checkout/route.ts', 'utf-8');

// Update req.json() to accept method
content = content.replace(
    /const \{ listing_id \} = await req\.json\(\);/,
    `const { listing_id, method = 'WALLET' } = await req.json();`
);

// Update wallet check and deduction logic
const walletBlock = `        if (balance < totalCost) {
            return NextResponse.json({ error: "Insufficient funds in wallet." }, { status: 400 });
        }

        // 4. The Escrow Execution
        // Deduct the item price + fee from the buyer's wallet balance
        const { error: deductError } = await supabase
            .from('profiles')
            .update({ wallet_balance: balance - totalCost })
            .eq('id', user.id);

        if (deductError) throw deductError;`;

const updatedWalletBlock = `        if (method === 'WALLET') {
            if (balance < totalCost) {
                return NextResponse.json({ error: "Insufficient funds in wallet." }, { status: 400 });
            }

            // Deduct the item price + fee from the buyer's wallet balance
            const { error: deductError } = await supabase
                .from('profiles')
                .update({ wallet_balance: balance - totalCost })
                .eq('id', user.id);

            if (deductError) throw deductError;
        }

        // 4. The Escrow Execution`;

content = content.replace(walletBlock, updatedWalletBlock);

// Update email
const emailBlock = `        // 6. Send Email Notification
        if (user.email) {
            const htmlBody = "<h1>Checkout Confirmed!</h1><p>Your purchase was successful.</p>";
            
            await sendNotificationEmail(
                user.email,
                'Checkout Confirmed! ??',
                htmlBody
            );
        }`;

const updatedEmailBlock = `        // 6. Send Email Notification
        if (user.email) {
            const htmlBody = \`<div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #000;">Checkout Confirmed! ??</h1>
                <p>Your purchase of <strong>\${listing.title}</strong> was successful.</p>
                <p>You paid <strong>?\${totalCost.toLocaleString()}</strong>.</p>
                <p style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
                    Your funds are currently locked in Escrow. Contact the seller to arrange pickup, and then scan their QR code to release the funds.
                </p>
                <br />
                <p style="color: #666; font-size: 12px;">© 2026 HostelPulse. Built for LAUTECH & Beyond.</p>
            </div>\`;
            
            await sendNotificationEmail(
                user.email,
                'Checkout Confirmed! ??',
                htmlBody
            );
        }`;

content = content.replace(emailBlock, updatedEmailBlock);

fs.writeFileSync('app/api/market/checkout/route.ts', content, 'utf-8');
console.log("Updated api/market/checkout/route.ts");
