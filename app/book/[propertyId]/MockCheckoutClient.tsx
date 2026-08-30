"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Lock, Calendar, CreditCard, Wallet } from "lucide-react";
import toast from "react-hot-toast";

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

export default function MockCheckoutClient({
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
    studentId
}: Props) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkInDate, setCheckInDate] = useState("");
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchWallet = async () => {
            const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', studentId).single();
            if (data) setWalletBalance(Number(data.wallet_balance || 0));
        };
        fetchWallet();
    }, [studentId, supabase]);

    const executePayment = async (method: 'WALLET' | 'CARD') => {
        if (!checkInDate) {
            toast.error("Please select a move-in date");
            return;
        }

        if (method === 'WALLET') {
            if (walletBalance === null || walletBalance < totalAmount) {
                toast.error("Insufficient wallet balance.");
                return;
            }
        }

        setIsProcessing(true);
        toast.loading(`Processing payment via ${method === 'WALLET' ? 'Wallet' : 'Card'}...`, { id: "payment" });

        try {
            if (method === 'WALLET') {
                const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
                    payee_id_param: studentId,
                    amount_param: -totalAmount
                });
                if (walletError) throw walletError;
            }

            // 1. Create Escrow Transaction
            const { data: escrowData, error: escrowError } = await supabase
                .from("escrow_transactions")
                .insert({
                    property_id: propertyId,
                    amount: totalAmount,
                    payer_id: studentId,
                    buyer_id: studentId,
                    payee_id: providerId,
                    seller_id: providerId,
                    agent_id: providerId,
                    status: "Locked",
                    type: "RENT"
                })
                .select("id")
                .single();

            if (escrowError) throw escrowError;

            // 2. Create Booking
            const { error: bookingError } = await supabase
                .from("bookings")
                .insert({
                    property_id: propertyId,
                    student_id: studentId,
                    provider_id: providerId,
                    status: "Confirmed",
                    check_in_date: checkInDate,
                    duration_months: 12,
                    total_price: totalAmount,
                    escrow_id: escrowData.id
                });

            if (bookingError) throw bookingError;

            // 3. Send automated message
            await supabase.from("messages").insert({
                sender_id: studentId,
                receiver_id: providerId,
                property_id: propertyId,
                content: `SYSTEM: Booking Confirmed! Escrow has locked ₦${totalAmount.toLocaleString()}. Expected move-in date: ${checkInDate}.`,
                is_read: false
            });

            // 4. Send Notification to Provider
            await supabase.from("notifications").insert({
                user_id: providerId,
                title: "New Booking Request!",
                message: `Escrow has locked ₦${totalAmount.toLocaleString()} for a new booking.`,
                body: `Escrow has locked ₦${totalAmount.toLocaleString()} for a new booking.`,
                type: "success",
                link: "/dashboard/agent?tab=wallet",
                is_read: false
            });

            // 5. Send Notification to Student (Buyer)
            await supabase.from("notifications").insert({
                user_id: studentId,
                title: "Checkout Successful!",
                message: `Your payment of ₦${totalAmount.toLocaleString()} has been locked in Escrow.`,
                body: `Your payment of ₦${totalAmount.toLocaleString()} has been locked in Escrow.`,
                type: "success",
                link: "/dashboard/student?tab=wallet",
                is_read: false
            });

            toast.success(`Payment Successful via ${method === 'WALLET' ? 'Wallet' : 'Card'}! Funds Locked.`, { id: "payment" });
            
            setTimeout(() => {
                router.push("/messages"); // Redirect to messages conversation
            }, 1500);

        } catch (error: any) {
            console.error("Payment Flow Error:", error);
            toast.error("Payment failed: " + error.message, { id: "payment" });
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row items-center gap-6">
                <img src={propertyImage} alt={propertyTitle} className="w-24 h-24 object-cover rounded-2xl shadow-sm" />
                <div className="flex-1 text-center md:text-left">
                    <p className="text-[#0D9488] font-black uppercase tracking-widest text-xs mb-1">Booking Request</p>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{propertyTitle}</h2>
                    <p className="text-gray-500 font-medium text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                        Hosted by {providerName} 
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </p>
                </div>
            </div>

            <div className="p-8">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left Column: Form & details */}
                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Move-In Date
                            </label>
                            <input 
                                type="date"
                                value={checkInDate}
                                onChange={(e) => setCheckInDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                            />
                        </div>

                        <div className="bg-[#BEF264]/10 rounded-2xl p-6 border border-[#BEF264]/30">
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2 mb-2">
                                <Lock className="w-4 h-4" /> HostelPulse Escrow
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Your money is held safely by HostelPulse. It is only released to the landlord <strong>after</strong> you have moved in and verified the property. 
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Pricing Summary */}
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <h3 className="font-black uppercase tracking-widest text-gray-900 mb-6 text-sm">Price Breakdown</h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">1 Year Rent</span>
                                <span className="font-bold text-gray-900">₦{basePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Legal / Agency (5%)</span>
                                <span className="font-bold text-gray-900">₦{legalFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Buyer Protection</span>
                                <span className="font-bold text-gray-900">₦{protectionFee.toLocaleString()}</span>
                            </div>
                            
                            <div className="h-px w-full bg-gray-200 my-4" />
                            
                            <div className="flex justify-between items-center">
                                <span className="font-black uppercase tracking-widest text-gray-900 text-sm">Total Due</span>
                                <span className="font-black text-2xl text-gray-900">₦{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button 
                                onClick={() => executePayment('WALLET')}
                                disabled={isProcessing || walletBalance === null || walletBalance < totalAmount}
                                className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-[#a6d456] transition-transform active:scale-95 flex items-center justify-between px-6 shadow-lg shadow-[#BEF264]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5" /> Pay from Wallet
                                </span>
                                {walletBalance !== null && (
                                    <span className="text-[10px] bg-black/10 px-2 py-1 rounded-lg">
                                        Bal: ₦{walletBalance.toLocaleString()}
                                    </span>
                                )}
                            </button>

                            <button 
                                onClick={() => executePayment('CARD')}
                                disabled={isProcessing}
                                className="w-full bg-black text-[#BEF264] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-neutral-800 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-gray-200 disabled:opacity-50"
                            >
                                {isProcessing ? "Processing..." : (
                                    <>
                                        <CreditCard className="w-5 h-5" /> Pay with Card (Mock)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
