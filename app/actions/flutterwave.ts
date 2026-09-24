"use server";

// ─────────────────────────────────────────────────────────────────────────────
// Fetch Bank List (NG)
// ─────────────────────────────────────────────────────────────────────────────
export async function getNigerianBanks() {
    try {
        const SECRET_KEY = process.env.FLW_SECRET_KEY;
        if (!SECRET_KEY) return { error: "Configuration missing." };

        const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${SECRET_KEY}`
            },
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        const result = await response.json();
        
        if (result.status === "success") {
            // Sort alphabetically
            const banks = result.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
            return { success: true, banks };
        }
        return { error: "Failed to load banks." };
    } catch (error: any) {
        return { error: "Network error fetching banks." };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolve Account Number
// ─────────────────────────────────────────────────────────────────────────────
export async function resolveBankAccount(accountNumber: string, bankCode: string) {
    try {
        const SECRET_KEY = process.env.FLW_SECRET_KEY;
        if (!SECRET_KEY) return { error: "Configuration missing." };

        if (!accountNumber || accountNumber.length < 10 || !bankCode) {
            return { error: "Invalid details." };
        }

        const response = await fetch("https://api.flutterwave.com/v3/accounts/resolve", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account_number: accountNumber,
                account_bank: bankCode
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            return { success: true, accountName: result.data.account_name };
        } else {
            return { error: result.message || "Could not verify account name." };
        }
    } catch (error: any) {
        return { error: "Network error verifying account." };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Process Transfer
// ─────────────────────────────────────────────────────────────────────────────
export async function processFlutterwaveTransfer(amount: number, bankCode: string, accountNumber: string) {
    try {
        const SECRET_KEY = process.env.FLW_SECRET_KEY;
        if (!SECRET_KEY) {
            return { error: "Flutterwave configuration missing." };
        }

        const reference = `HP-OUT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        const response = await fetch("https://api.flutterwave.com/v3/transfers", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account_bank: bankCode,
                account_number: accountNumber,
                amount: amount,
                narration: "HostelPulse Withdrawal",
                currency: "NGN",
                reference: reference,
                debit_currency: "NGN"
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            return { success: true, reference: result.data.reference };
        } else {
            return { error: result.message || "Transfer failed via Flutterwave." };
        }
    } catch (error: any) {
        console.error("Flutterwave Transfer Error:", error);
        return { error: error.message || "An unexpected error occurred during transfer." };
    }
}
