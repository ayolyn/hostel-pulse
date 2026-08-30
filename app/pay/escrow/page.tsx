"use client";
export const runtime = 'edge';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, CreditCard, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

import { Suspense } from 'react';

function EscrowPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    const msgId = searchParams.get('msg_id');
    const propId = searchParams.get('prop_id');
    const amount = searchParams.get('amount') || '2000';

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = async () => {
        if (!msgId) {
            toast.error("Invalid payment link: Missing message ID.");
            return;
        }

        setIsProcessing(true);

        try {
            // Mocking a payment gateway delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Fetch the existing message to safely replace the string
            const { data: msg, error: fetchError } = await supabase
                .from('messages')
                .select('content')
                .eq('id', msgId)
                .single();

            if (fetchError || !msg) throw new Error("Could not find the inspection invoice.");

            // Update the state from pending to paid
            const newContent = msg.content.replace('🚀 INSPECTION LINK:', '✅ INSPECTION CONFIRMED:');
            
            const { error: updateError } = await supabase
                .from('messages')
                .update({ content: newContent })
                .eq('id', msgId);

            if (updateError) throw new Error(updateError.message);

            setIsSuccess(true);
            toast.success("Inspection Fee Paid!");
            
            // Redirect back after short delay
            setTimeout(() => {
                router.back();
            }, 1500);

        } catch (error: any) {
            toast.error(error.message || "Payment failed");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-black text-white p-6 relative">
                    <button onClick={() => router.back()} className="absolute top-6 left-6 text-white/70 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center mt-2">
                        <div className="w-16 h-16 bg-[#BEF264] text-black rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-xl font-black uppercase tracking-widest">Escrow Payment</h1>
                        <p className="text-white/60 text-xs mt-1">HostelPulse Secure Checkout</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {isSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">Payment Successful</h2>
                            <p className="text-sm font-medium text-gray-500 mb-6">Your inspection slot has been confirmed.</p>
                            <Loader2 className="w-6 h-6 text-[#BEF264] animate-spin mx-auto" />
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-gray-500">Inspection Fee</span>
                                    <span className="text-lg font-black text-gray-900">₦{Number(amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500">Service Charge</span>
                                    <span className="text-lg font-black text-gray-900">₦0</span>
                                </div>
                                <div className="h-px bg-gray-200 my-4" />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-900 uppercase">Total to Pay</span>
                                    <span className="text-2xl font-black text-[#BEF264] bg-black px-3 py-1 rounded-lg">
                                        ₦{Number(amount).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#a6d456] active:scale-95 transition-all shadow-lg shadow-[#BEF264]/20 disabled:opacity-50 disabled:scale-100"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pay with Wallet
                                    </>
                                )}
                            </button>
                            
                            <p className="text-center text-[10px] font-bold text-gray-400 mt-6 max-w-xs mx-auto">
                                By paying, you agree to the HostelPulse Escrow Terms. Your money is protected until you confirm the inspection.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EscrowPaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>}>
            <EscrowPaymentContent />
        </Suspense>
    );
}
