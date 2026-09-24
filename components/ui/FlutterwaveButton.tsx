"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { useFlutterwave, FlutterwavePaymentConfig } from "@/hooks/useFlutterwave";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface FlutterwaveButtonProps {
    /** Amount in NGN */
    amount: number;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    /** The display name shown in the FLW modal (property / item title) */
    hostelName: string;
    /** Optional existing booking ID in your DB — will be updated on success */
    bookingId?: string;
    meta: Omit<FlutterwavePaymentConfig["meta"], "payer_id"> & { payer_id: string };
    /** Called after a confirmed successful payment */
    onSuccess?: (tx_ref: string, amount: number) => void;
    /** Optional: override what happens on success (e.g. redirect) */
    onSuccessRedirect?: string;
    /** Label shown on the button */
    label?: string;
    /** Extra Tailwind classes for the button */
    className?: string;
    disabled?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FlutterwaveButton({
    amount,
    customerEmail,
    customerName,
    customerPhone,
    hostelName,
    bookingId,
    meta,
    onSuccess,
    onSuccessRedirect,
    label = "Pay with Card",
    className = "",
    disabled = false,
}: FlutterwaveButtonProps) {
    const { handlePayment } = useFlutterwave();
    const [loading, setLoading] = useState(false);

    const initiatePayment = async () => {
        if (loading || disabled) return;
        setLoading(true);
        const toastId = toast.loading("Opening secure payment…");

        try {
            await handlePayment({
                amount,
                customer: {
                    email: customerEmail,
                    name: customerName,
                    phone_number: customerPhone,
                },
                meta: { ...meta, booking_id: bookingId },
                title: "HostelPulse Escrow",
                description: `Secure escrow payment for ${hostelName}`,
                onSuccess: (tx_ref, paidAmount) => {
                    toast.success("Payment confirmed! Funds held in escrow 🔒", {
                        id: toastId,
                        duration: 4000,
                    });
                    onSuccess?.(tx_ref, paidAmount);
                    if (onSuccessRedirect) {
                        // Small delay so the toast is visible before navigating
                        setTimeout(() => {
                            window.location.href = onSuccessRedirect;
                        }, 1500);
                    }
                },
                onClose: () => {
                    toast.dismiss(toastId);
                    setLoading(false);
                },
                onError: (msg) => {
                    toast.error(msg, { id: toastId });
                    setLoading(false);
                },
            });
        } catch {
            // onError already handled above
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={initiatePayment}
            disabled={loading || disabled}
            aria-busy={loading}
            className={[
                "relative w-full flex items-center justify-center gap-2",
                "bg-black text-[#BEF264] font-black uppercase tracking-widest",
                "py-3 rounded-2xl transition-transform active:scale-95",
                "hover:bg-neutral-800 shadow-xl shadow-gray-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className,
            ].join(" ")}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                </>
            ) : (
                <>
                    <CreditCard className="w-4 h-4" />
                    {label}
                </>
            )}
            {/* Escrow badge */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <ShieldCheck className="w-4 h-4 text-[#BEF264]/60" />
            </span>
        </button>
    );
}
