"use client";
export const runtime = 'edge';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, Wallet, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useFlutterwave } from '@/hooks/useFlutterwave';
import toast from 'react-hot-toast';

function EscrowPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();
    const { handlePayment } = useFlutterwave();

    const msgId = searchParams.get('msg_id');
    const propId = searchParams.get('prop_id');
    const rawAmount = searchParams.get('amount') || '2000';
    const amount = Number(rawAmount) > 0 ? Number(rawAmount) : 2000;

    const [user, setUser] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [loadingData, setLoadingData] = useState(true);
    const [isProcessingWallet, setIsProcessingWallet] = useState(false);
    const [isProcessingCard, setIsProcessingCard] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                setLoadingData(false);
                return;
            }
            setUser(currentUser);

            const { data: profile } = await supabase
                .from('profiles')
                .select('wallet_balance')
                .eq('id', currentUser.id)
                .single();

            if (profile) {
                setWalletBalance(Number(profile.wallet_balance || 0));
            }
            setLoadingData(false);
        };

        fetchUserData();
    }, [supabase]);

    const completeInspectionMessage = async () => {
        if (!msgId) return;
        try {
            const { data: msg } = await supabase
                .from('messages')
                .select('content')
                .eq('id', msgId)
                .single();

            if (msg?.content && msg.content.includes('🚀 INSPECTION LINK:')) {
                const newContent = msg.content.replace('🚀 INSPECTION LINK:', '✅ INSPECTION CONFIRMED:');
                await supabase.from('messages').update({ content: newContent }).eq('id', msgId);
            }
        } catch (e) {
            console.error('Failed to update message:', e);
        }
    };

    const handleWalletPayment = async () => {
        if (!user) {
            toast.error("Please sign in to complete payment.");
            return;
        }

        if (walletBalance < amount) {
            toast.error("Insufficient wallet balance. Please top up or pay with card.");
            return;
        }

        setIsProcessingWallet(true);

        try {
            // Find property payee if possible
            let payeeId: string | null = null;
            if (propId) {
                const { data: property } = await supabase
                    .from('properties')
                    .select('agent_id, landlord_id, owner_id')
                    .eq('id', propId)
                    .maybeSingle();

                if (property) {
                    payeeId = property.agent_id || property.landlord_id || property.owner_id;
                }
            }

            // Fallback: check message sender if property lookup yielded nothing
            if (!payeeId && msgId) {
                const { data: msg } = await supabase
                    .from('messages')
                    .select('sender_id')
                    .eq('id', msgId)
                    .maybeSingle();
                if (msg?.sender_id) {
                    payeeId = msg.sender_id;
                }
            }

            // Deduct from wallet with resilient fallback
            let walletError: any = null;
            const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
                user_id_param: user.id,
                amount_param: -amount
            });

            if (rpcError) {
                const { error: rpc2 } = await supabase.rpc('increment_wallet_balance', {
                    payee_id_param: user.id,
                    amount_param: -amount
                });
                if (rpc2) {
                    const newBal = walletBalance - amount;
                    const { error: updateErr } = await supabase
                        .from('profiles')
                        .update({ wallet_balance: newBal })
                        .eq('id', user.id);
                    walletError = updateErr;
                }
            }

            if (walletError) throw new Error("Failed to deduct wallet funds: " + walletError.message);

            // Record escrow transaction
            await supabase.from('escrow_transactions').insert({
                payer_id: user.id,
                payee_id: payeeId,
                property_id: propId || null,
                amount: amount,
                status: 'Held',
                type: 'INSPECTION_FEE',
                dispute_status: 'NONE'
            });

            // Update inspection message to confirmed
            await completeInspectionMessage();

            setIsSuccess(true);
            toast.success("Inspection Fee Paid via Wallet!");

            setTimeout(() => {
                router.back();
            }, 1800);

        } catch (error: any) {
            toast.error(error.message || "Wallet payment failed");
            setIsProcessingWallet(false);
        }
    };

    const handleCardPayment = async () => {
        if (!user) {
            toast.error("Please sign in to complete payment.");
            return;
        }

        setIsProcessingCard(true);

        try {
            // Find property payee
            let payeeId: string | undefined = undefined;
            if (propId) {
                const { data: property } = await supabase
                    .from('properties')
                    .select('agent_id, landlord_id, owner_id')
                    .eq('id', propId)
                    .maybeSingle();

                if (property) {
                    payeeId = property.agent_id || property.landlord_id || property.owner_id;
                }
            }

            await handlePayment({
                amount: amount,
                currency: 'NGN',
                customer: {
                    email: user.email || '',
                    name: user.user_metadata?.full_name || 'Student',
                },
                meta: {
                    payer_id: user.id,
                    property_id: propId || undefined,
                    agent_id: payeeId,
                    type: 'inspection'
                },
                title: 'Inspection Fee Escrow',
                description: 'HostelPulse Escrow-Protected Inspection Fee',
                onSuccess: async () => {
                    await completeInspectionMessage();
                    setIsSuccess(true);
                    toast.success("Inspection Fee Paid Successfully!");
                    setTimeout(() => {
                        router.back();
                    }, 1800);
                },
                onError: (err) => {
                    toast.error(err || 'Card payment failed');
                    setIsProcessingCard(false);
                },
                onClose: () => {
                    setIsProcessingCard(false);
                }
            });
        } catch (err: any) {
            toast.error(err.message || "Failed to initialize card payment");
            setIsProcessingCard(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
                {/* Header */}
                <div className="bg-black dark:bg-neutral-900/80 text-white p-6 relative border-b border-white/10">
                    <button 
                        onClick={() => router.back()} 
                        className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center mt-2">
                        <div className="w-14 h-14 bg-[#BEF264] text-black rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight">Escrow Payment</h1>
                        <p className="text-white/60 text-xs mt-0.5">HostelPulse Secure Checkout</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6">
                    {loadingData ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-[#BEF264]" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading details...</p>
                        </div>
                    ) : isSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">Payment Successful</h2>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6">Your inspection fee is securely held in escrow and your slot is confirmed.</p>
                            <Loader2 className="w-6 h-6 text-[#BEF264] animate-spin mx-auto" />
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 sm:p-5 mb-6 border border-gray-100 dark:border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="font-bold text-gray-500 dark:text-gray-400">Inspection Fee</span>
                                    <span className="font-black text-gray-900 dark:text-white">₦{amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="font-bold text-gray-500 dark:text-gray-400">Escrow Protection</span>
                                    <span className="font-black text-emerald-500 uppercase text-[10px] tracking-wider">Free (Guaranteed)</span>
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-white/10 my-1" />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Total to Pay</span>
                                    <span className="text-lg sm:text-xl font-black text-[#BEF264] bg-black px-3 py-1 rounded-xl shadow-sm">
                                        ₦{amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Wallet Pay Button */}
                                <button
                                    onClick={handleWalletPayment}
                                    disabled={isProcessingWallet || isProcessingCard || walletBalance < amount}
                                    className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                                            <Wallet size={18} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-xs sm:text-sm uppercase tracking-wider text-gray-900 dark:text-white">Pay from Wallet</div>
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                                                Balance: ₦{walletBalance.toLocaleString()} {walletBalance < amount ? '(Insufficient)' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    {isProcessingWallet && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                                </button>

                                {/* Card / Bank Pay Button */}
                                <button
                                    onClick={handleCardPayment}
                                    disabled={isProcessingWallet || isProcessingCard}
                                    className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                                            <CreditCard size={18} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-xs sm:text-sm uppercase tracking-wider text-gray-900 dark:text-white">Pay via Card / Bank</div>
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">Secured by Flutterwave</div>
                                        </div>
                                    </div>
                                    {isProcessingCard && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                                </button>
                            </div>

                            <p className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-6 max-w-xs mx-auto leading-relaxed">
                                🛡️ HOSTELPULSE Guarantee: Your ₦{amount.toLocaleString()} is held in escrow. If the agent does not show up, you get an instant refund.
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
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-[#BEF264]" /></div>}>
            <EscrowPaymentContent />
        </Suspense>
    );
}
