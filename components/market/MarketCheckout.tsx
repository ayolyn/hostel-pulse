'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {  ShieldCheck, Info, X, CheckCircle, CreditCard, ArrowRight , Smartphone, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

import { ReviewModal } from './ReviewModal';

interface MarketCheckoutProps {
    item: {
        id: string;
        title: string;
        price: number;
        category: string;
        seller_id: string;
    };
    onClose: () => void;
    onSuccess?: () => void;
}

export function MarketCheckout({ item, onClose, onSuccess }: MarketCheckoutProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showReview, setShowReview] = useState(false);
    const supabase = createClient();

    if (!item) return null;

    // Logic: Fridges are ₦1,000 flat. Others: ₦500 under 20k, ₦1,000 under 50k, 2.5% above 50k
    let serviceFee = 1000;
    if ((item?.category || '').toLowerCase().includes('appliance') || (item?.title || '').toLowerCase().includes('fridge')) {
        serviceFee = 1000;
    } else if (item.price < 20000) {
        serviceFee = 500;
    } else if (item.price > 50000) {
        serviceFee = Math.floor(item.price * 0.025);
    }
    const total = Number(item.price) + serviceFee;

    const handlePurchase = async (method: 'WALLET' | 'CARD' | 'OPAY') => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in to purchase items.');

            if (user.id === item.seller_id) {
                toast.error('Security Alert: You cannot buy your own item to inflate your trust level.');
                setLoading(false);
                return;
            }

            const res = await fetch('/api/market/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: item.id, method })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Checkout failed');
            }

            setStep(2); // Success step
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error('Purchase error:', err);
            // Catch the specific RPC error or network failures
            if (err.message?.includes('Insufficient wallet balance')) {
                toast.error('Insufficient wallet balance. Please fund your wallet.');
            } else {
                toast.error(err.message || 'Payment failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (showReview) {
        return (
            <ReviewModal 
                sellerId={item.seller_id}
                itemId={item.id}
                buyerName="Student Buyer"
                onClose={onClose}
                onSuccess={() => {}}
            />
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-white/5 w-full max-w-sm mx-auto shadow-2xl relative overflow-hidden">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors z-10">
                <X className="w-5 h-5" />
            </button>

            <div className="p-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
                {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-[#BEF264]/10 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-[#BEF264]" />
                            </div>
                            <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">Secure Checkout</h3>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.title}</span>
                                <span className="font-black text-gray-900 dark:text-white">₦{item.price.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center px-4">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">Escrow Protection Fee</span>
                                    <Info size={10} className="text-[#0D9488]" />
                                </div>
                                <span className="font-black text-[#0D9488] text-sm">₦{serviceFee.toLocaleString()}</span>
                            </div>

                            <div className="h-[2px] bg-neutral-100 dark:bg-white/5 mx-2" />

                            <div className="flex justify-between items-center px-4 py-2">
                                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Total to Pay</span>
                                <span className="text-2xl font-black text-black dark:text-[#BEF264]">₦{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-[#BEF264]/5 border border-[#BEF264]/20 p-4 rounded-2xl mb-8 flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-[#BEF264] shrink-0" />
                            <p className="text-[9px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                <strong>Inspect then Scan:</strong> Your money is held securely by HOSTELPULSE Escrow. Only scan the seller's QR code after you have inspected the {item.category} and are 100% satisfied.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={() => handlePurchase('WALLET')}
                                disabled={loading}
                                className="w-full bg-[#BEF264] text-black font-black py-5 rounded-2xl shadow-xl shadow-[#BEF264]/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                            >
                                <Wallet className="w-5 h-5" />
                                <span className="uppercase tracking-widest text-[11px]">Pay from Wallet</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={() => handlePurchase('CARD')}
                                disabled={loading}
                                className="w-full bg-black text-[#BEF264] font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                            >
                                <CreditCard className="w-5 h-5" />
                                <span className="uppercase tracking-widest text-[11px]">Pay with Paystack</span>
                            </button>
                            <button 
                                onClick={() => handlePurchase('OPAY')}
                                disabled={loading}
                                className="w-full bg-[#1dbf73] text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                            >
                                <Smartphone className="w-5 h-5" />
                                <span className="uppercase tracking-widest text-[11px]">Pay with OPay</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#BEF264]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Item Secured!</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                            Payment is held in Escrow. Contact the seller to arrange pickup. Use your QR scanner when you meet!
                        </p>
                        <div className="space-y-3 mt-8">
                            <button 
                                onClick={() => setShowReview(true)}
                                className="w-full bg-[#BEF264] text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] transition-all"
                            >
                                Leave a Review
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Back to Market
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
