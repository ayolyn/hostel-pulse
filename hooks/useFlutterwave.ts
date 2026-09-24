"use client";

import { createClient } from "@/lib/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface FlutterwavePaymentConfig {
    /** Amount in NGN */
    amount: number;
    currency?: "NGN";
    customer: {
        email: string;
        phone_number?: string;
        name: string;
    };
    meta: {
        /** The escrow / booking record ID from your DB */
        booking_id?: string;
        property_id?: string;
        agent_id?: string;
        landlord_id?: string;
        listing_id?: string;
        seller_id?: string;
        payer_id: string;
        type: "inspection" | "rent" | "buy" | "market" | "deposit";
        legal_fee?: number;
        protection_fee?: number;
    };
    /** Display title in the Flutterwave modal */
    title?: string;
    description?: string;
    onSuccess: (tx_ref: string, amount: number) => void;
    onClose?: () => void;
    onError?: (error: string) => void;
}

declare global {
    interface Window {
        FlutterwaveCheckout: (config: unknown) => void;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export const useFlutterwave = () => {
    const supabase = createClient();
    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

    /**
     * Launches the Flutterwave v3 inline checkout modal.
     * - Generates a unique tx_ref for every attempt (HSL-<timestamp>-<random>)
     * - On success: creates/upserts escrow_transactions record as a client-side
     *   safety net (the webhook will also upsert it — idempotent)
     * - On failure: does nothing extra; webhook will mark status = 'Failed'
     */
    const handlePayment = async (config: FlutterwavePaymentConfig): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Guard: Flutterwave script loaded?
            if (typeof window === "undefined" || !window.FlutterwaveCheckout) {
                const msg = "Payment gateway is loading. Please refresh and try again.";
                config.onError?.(msg);
                reject(new Error(msg));
                return;
            }

            // Guard: public key present?
            if (!publicKey || publicKey.trim() === "") {
                const msg = "Payment gateway misconfigured. Contact support.";
                config.onError?.(msg);
                reject(new Error(msg));
                return;
            }

            // Unique tx_ref for every attempt — prevents double-charging
            const tx_ref = `HSL-${config.meta.type.toUpperCase()}-${Date.now()}-${Math.floor(
                Math.random() * 1_000_000
            )}`;

            window.FlutterwaveCheckout({
                public_key: publicKey,
                tx_ref,
                amount: config.amount,
                currency: config.currency ?? "NGN",
                customer: {
                    email: config.customer.email,
                    phone_number: config.customer.phone_number ?? "",
                    name: config.customer.name,
                },
                meta: {
                    // All meta fields end up in payload.data.meta on the webhook
                    booking_id: config.meta.booking_id ?? null,
                    property_id: config.meta.property_id ?? null,
                    agent_id: config.meta.agent_id ?? null,
                    landlord_id: config.meta.landlord_id ?? null,
                    listing_id: config.meta.listing_id ?? null,
                    seller_id: config.meta.seller_id ?? null,
                    payer_id: config.meta.payer_id,
                    type: config.meta.type,
                    legal_fee: config.meta.legal_fee ?? 0,
                    protection_fee: config.meta.protection_fee ?? 0,
                },
                customizations: {
                    title: config.title ?? "HostelPulse Secure Payment",
                    description:
                        config.description ??
                        `Escrow-protected payment for ${config.meta.type} on HostelPulse`,
                    logo: "https://hostelpulse.app/logo-icon.png",
                },

                // ── Callback: fires after payment attempt ───────────────────
                callback: async (data: {
                    status: string;
                    tx_ref: string;
                    transaction_id: number;
                    amount: number;
                    currency: string;
                    customer: { email: string; name: string };
                }) => {
                    if (data.status === "successful" || data.status === "completed") {
                        try {
                            // Client-side safety net: upsert the escrow record.
                            // The webhook will also do this — the onConflict: 'tx_ref'
                            // makes this idempotent (no duplicate records).
                            await supabase.from("escrow_transactions").upsert(
                                {
                                    tx_ref,
                                    flw_id: String(data.transaction_id),
                                    status: "Held",
                                    amount: config.amount,
                                    property_id: config.meta.property_id ?? null,
                                    payer_id: config.meta.payer_id,
                                    agent_id: config.meta.agent_id ?? null,
                                    landlord_id: config.meta.landlord_id ?? null,
                                    legal_fee: config.meta.legal_fee ?? 0,
                                    service_fee: config.meta.protection_fee ?? 0,
                                    payer_type:
                                        config.meta.type === "market"
                                            ? "buyer"
                                            : "student",
                                    created_at: new Date().toISOString(),
                                },
                                { onConflict: "tx_ref" }
                            );

                            // If a booking_id was provided, mark it CONFIRMED
                            if (config.meta.booking_id) {
                                await supabase
                                    .from("bookings")
                                    .update({ status: "CONFIRMED", payment_status: "PAID" })
                                    .eq("id", config.meta.booking_id);
                            }

                            config.onSuccess(tx_ref, config.amount);
                            resolve();
                        } catch (err: unknown) {
                            const msg =
                                err instanceof Error
                                    ? err.message
                                    : "Failed to record payment.";
                            config.onError?.(msg);
                            reject(new Error(msg));
                        }
                    } else {
                        // Payment failed or was cancelled inside the modal
                        if (config.meta.booking_id) {
                            await supabase
                                .from("bookings")
                                .update({ status: "FAILED", payment_status: "FAILED" })
                                .eq("id", config.meta.booking_id)
                                .catch(() => null); // non-critical
                        }
                        const msg = `Payment ${data.status}. Please try again.`;
                        config.onError?.(msg);
                        reject(new Error(msg));
                    }
                },

                // ── onclose: fires if user closes the modal manually ────────
                onclose: () => {
                    config.onClose?.();
                    // Don't reject here — the user just closed the modal
                    resolve();
                },
            });
        });
    };

    return { handlePayment };
};
