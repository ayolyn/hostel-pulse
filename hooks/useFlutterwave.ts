"use client";

import { createClient } from "@/lib/supabase/client";

interface FlutterwaveConfig {
    amount: number;
    currency: string;
    customer: {
        email: string;
        phone_number?: string;
        name: string;
    };
    meta: {
        property_id?: string;
        agent_id?: string;
        landlord_id?: string;
        payer_id?: string;
        type: "inspection" | "rent";
        legal_fee?: number;
        protection_fee?: number;
    };
    onSuccess: (tx_ref: string) => void;
    onClose: () => void;
}

declare global {
    interface Window {
        FlutterwaveCheckout: (config: any) => void;
    }
}

export const useFlutterwave = () => {
    const supabase = createClient();
    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

    const handlePayment = async (config: FlutterwaveConfig) => {
        if (typeof window === 'undefined' || !window.FlutterwaveCheckout) {
            console.error("Flutterwave script not loaded");
            config.onClose();
            throw new Error("Payment gateway is currently loading or unavailable. Please refresh the page and try again.");
        }

        if (!publicKey || publicKey.trim() === '') {
            console.error("Flutterwave public key is missing");
            config.onClose();
            throw new Error("Payment Gateway Configuration Error: Missing Public Key.");
        }

        const tx_ref = `HSL-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        window.FlutterwaveCheckout({
            public_key: publicKey,
            tx_ref: tx_ref,
            amount: config.amount,
            currency: "NGN",
            payment_options: "card,ussd,banktransfer,account",
            customer: config.customer,
            customizations: {
                title: "HOSTELPULSE Housing",
                description: `Payment for ${config.meta.type} on HOSTELPULSE`,
                logo: "https://HOSTELPULSE.com.ng/icon.png",
            },
            callback: async (data: any) => {
                if (data.status === "successful") {
                    // Record in Supabase Escrow Transactions
                    const { data: { user } } = await supabase.auth.getUser();
                    
                    if (user) {
                        const { error } = await supabase
                            .from('escrow_transactions')
                            .insert({
                                property_id: config.meta.property_id,
                                payer_id: user.id,
                                payer_type: 'student', 
                                agent_id: config.meta.agent_id,
                                landlord_id: config.meta.landlord_id,
                                amount: config.amount,
                                inspection_fee: config.meta.type === 'inspection' ? config.amount : 0,
                                legal_fee: (config.meta as any).legal_fee || 0,
                                service_fee: (config.meta as any).protection_fee || 0,
                                status: 'Locked',
                                tx_ref: tx_ref,
                                created_at: new Date().toISOString()
                            });

                        if (error) {
                            console.error("Error recording escrow:", error);
                        } else {
                            config.onSuccess(tx_ref);
                        }
                    }
                }
            },
            onclose: () => {
                config.onClose();
            },
        });
    };

    return { handlePayment };
};
