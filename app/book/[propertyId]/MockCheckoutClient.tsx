"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Lock, Calendar, Wallet, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import FlutterwaveButton from "@/components/ui/FlutterwaveButton";
import Image from "next/image";

interface Props {
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    providerId: string;
    providerName: string;
    providerAvatar?: string;
    basePrice: number;
    legalFee: number;
    protectionFee: number;
    totalAmount: number;
    studentId: string;
}

export default function CheckoutClient({
    propertyId,
    propertyTitle,
    propertyImage,
    providerId,
    providerName,
    providerAvatar,
    basePrice,
    legalFee,
    protectionFee,
    totalAmount,
    studentId,
}: Props) {
    const [isProcessingWallet, setIsProcessingWallet] = useState(false);
    const [checkInDate, setCheckInDate] = useState("");
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [bookingId, setBookingId] = useState<string | undefined>();
    const router = useRouter();
    const supabase = createClient();

    // ── Fetch wallet balance + user profile ────────────────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("wallet_balance, full_name, contact_email")
                .eq("id", studentId)
                .single();
            if (data) {
                setWalletBalance(Number(data.wallet_balance ?? 0));
                setUserName(data.full_name ?? "");
                // contact_email may be null; fall back to auth email
                if (data.contact_email) setUserEmail(data.contact_email);
            }
            // Also get the auth email as fallback
            const { data: authData } = await supabase.auth.getUser();
            if (authData?.user?.email && !userEmail) {
                setUserEmail(authData.user.email);
            }
        };
        fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    // ── Pre-create a booking record (draft) so we have an ID for the meta ──
    // This makes the escrow webhook able to update the booking atomically.
    useEffect(() => {
        const preDraftBooking = async () => {
            const { data, error } = await supabase
                .from("bookings")
                .insert({
                    property_id: propertyId,
                    student_id: studentId,
                    provider_id: providerId,
                    amount: totalAmount,
                    status: "PENDING",
                    payment_status: "PENDING",
                    check_in_date: null,
                    created_at: new Date().toISOString(),
                })
                .select("id")
                .single();
            if (!error && data) setBookingId(data.id);
        };
        preDraftBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Wallet payment path ────────────────────────────────────────────────
    const handleWalletPayment = async () => {
        if (!checkInDate) {
            toast.error("Please select a move-in date");
            return;
        }
        if (walletBalance === null || walletBalance < totalAmount) {
            toast.error("Insufficient wallet balance. Top up or pay by card.");
            return;
        }

        setIsProcessingWallet(true);
        const toastId = toast.loading("Processing wallet payment…");
        try {
            // Deduct from wallet
            const { error: walletError } = await supabase.rpc(
                "increment_wallet_balance",
                { payee_id_param: studentId, amount_param: -totalAmount }
            );
            if (walletError) throw walletError;

            // Create escrow record
            const tx_ref = `HSL-WALLET-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
            const { error: escrowError } = await supabase
                .from("escrow_transactions")
                .insert({
                    property_id: propertyId,
                    payer_id: studentId,
                    payer_type: "student",
                    agent_id: providerId,
                    amount: totalAmount,
                    legal_fee: legalFee,
                    service_fee: protectionFee,
                    status: "Held",
                    tx_ref,
                    created_at: new Date().toISOString(),
                });
            if (escrowError) throw escrowError;

            // Update booking
            if (bookingId) {
                await supabase
                    .from("bookings")
                    .update({
                        status: "CONFIRMED",
                        payment_status: "PAID",
                        tx_ref,
                        check_in_date: checkInDate,
                    })
                    .eq("id", bookingId);
            }

            // Notify provider
            await supabase.from("notifications").insert({
                user_id: providerId,
                title: "New Booking / Escrow Held",
                message: `A student has secured payment for "${propertyTitle}" in Escrow. Check your Inspections tab.`,
                link: "/dashboard/agent",
                type: "new_inspection",
                is_read: false,
            });

            toast.success("Payment successful! Funds are locked in escrow 🔒", {
                id: toastId,
                duration: 4000,
            });
            setTimeout(() => {
                router.push(
                    `/booking/success?tx_ref=${tx_ref}&amount=${totalAmount}&property=${encodeURIComponent(propertyTitle)}`
                );
            }, 1200);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Payment failed";
            toast.error(msg, { id: toastId });
            setIsProcessingWallet(false);
        }
    };

    // ── Flutterwave success callback ───────────────────────────────────────
    const handleFlutterwaveSuccess = async (tx_ref: string) => {
        // Update booking with check-in date if selected
        if (bookingId && checkInDate) {
            await supabase
                .from("bookings")
                .update({ check_in_date: checkInDate, tx_ref })
                .eq("id", bookingId)
                .catch(() => null);
        }
        // Redirect to success page — the webhook will confirm in the background
        setTimeout(() => {
            router.push(
                `/booking/success?tx_ref=${tx_ref}&amount=${totalAmount}&property=${encodeURIComponent(propertyTitle)}`
            );
        }, 1500);
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
            {/* ── Property Header ─────────────────────────────────────────── */}
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-gray-200 relative">
                    <Image
                        src={propertyImage}
                        alt={propertyTitle}
                        fill
                        className="object-cover"
                        sizes="96px"
                    />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <p className="text-[#0D9488] font-black uppercase tracking-widest text-xs mb-1">
                        Secure Booking
                    </p>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                        {propertyTitle}
                    </h2>
                    <p className="text-gray-500 font-medium text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                        Hosted by {providerName}
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </p>
                </div>
            </div>

            <div className="p-5">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* ── Left: Move-in date + escrow info ──────────────── */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Move-In Date
                            </label>
                            <input
                                id="checkin-date"
                                name="checkin_date"
                                type="date"
                                value={checkInDate}
                                onChange={(e) => setCheckInDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black font-medium dark:bg-neutral-900 dark:border-white/10 dark:text-white"
                            />
                        </div>

                        <div className="bg-[#BEF264]/10 rounded-2xl p-6 border border-[#BEF264]/30">
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2 mb-2">
                                <Lock className="w-4 h-4" /> HostelPulse Escrow
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Your money is held safely by HostelPulse. It is only released
                                to the landlord{" "}
                                <strong>after</strong> you inspect and confirm the property.
                            </p>
                        </div>
                    </div>

                    {/* ── Right: Price breakdown + payment buttons ───────── */}
                    <div className="bg-gray-50 dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-white/10">
                        <h3 className="font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6 text-sm">
                            Price Breakdown
                        </h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">1 Year Rent</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    ₦{basePrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    Legal / Agency (5%)
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    ₦{legalFee.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    Buyer Protection
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    ₦{protectionFee.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-px w-full bg-gray-200 dark:bg-white/10 my-2" />
                            <div className="flex justify-between items-center">
                                <span className="font-black uppercase tracking-widest text-gray-900 dark:text-white text-sm">
                                    Total Due
                                </span>
                                <span className="font-black text-xl text-gray-900 dark:text-white">
                                    ₦{totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Payment Buttons */}
                        <div className="space-y-3">
                            {/* Wallet */}
                            <button
                                type="button"
                                onClick={handleWalletPayment}
                                disabled={
                                    isProcessingWallet ||
                                    walletBalance === null ||
                                    walletBalance < totalAmount
                                }
                                className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-[#a6d456] transition-transform active:scale-95 flex items-center justify-between px-6 shadow-lg shadow-[#BEF264]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="flex items-center gap-2">
                                    {isProcessingWallet ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Wallet className="w-4 h-4" />
                                    )}
                                    Pay from Wallet
                                </span>
                                {walletBalance !== null && (
                                    <span className="text-[10px] bg-black/10 px-2 py-1 rounded-lg">
                                        Bal: ₦{walletBalance.toLocaleString()}
                                    </span>
                                )}
                            </button>

                            {/* Flutterwave Card / USSD / Bank Transfer */}
                            <FlutterwaveButton
                                amount={totalAmount}
                                customerEmail={userEmail}
                                customerName={userName}
                                hostelName={propertyTitle}
                                bookingId={bookingId}
                                meta={{
                                    payer_id: studentId,
                                    property_id: propertyId,
                                    agent_id: providerId,
                                    type: "rent",
                                    legal_fee: legalFee,
                                    protection_fee: protectionFee,
                                }}
                                label="Pay with Card / USSD / Bank"
                                onSuccess={handleFlutterwaveSuccess}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
