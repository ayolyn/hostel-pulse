'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Info, X, CheckCircle, ArrowRight, Wallet, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import FlutterwaveButton from '@/components/ui/FlutterwaveButton';
import { ReviewModal } from './ReviewModal';

interface MarketCheckoutProps {
    item: {
        id: string;
        title: string;
        price: number;
        category?: string;
        seller_id: string;
    };
    onClose: () => void;
    onSuccess?: () => void;
}

export function MarketCheckout({ item, onClose, onSuccess }: MarketCheckoutProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showReview, setShowReview] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
    const supabase = createClient();

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, full_name, contact_email, phone, wallet_balance')
                    .eq('id', user.id)
                    .single();
                setUserProfile(data || { id: user.id });
            }
        }
        loadProfile();
    }, [supabase]);

    if (!item) return null;

    // Logic: Appliances/Fridges are ₦1,000 flat. Under 20k: ₦500. Over 50k: 2.5%. Else: ₦1,000
    let serviceFee = 1000;
    const cat = (item.category || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    if (cat.includes('appliance') || title.includes('fridge')) {
        serviceFee = 1000;
    } else if (Number(item.price) < 20000) {
        serviceFee = 500;
    } else if (Number(item.price) > 50000) {
        serviceFee = Math.floor(Number(item.price) * 0.025);
    }
    const total = Number(item.price) + serviceFee;
    const walletBalance = Number(userProfile?.wallet_balance || 0);
    const hasEnoughBalance = walletBalance >= total;

    const handleWalletPurchase = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in to purchase items.');

            if (user.id === item.seller_id) {
                toast.error('Security Alert: You cannot purchase your own listing.');
                setLoading(false);
                return;
            }

            const res = await fetch('/api/market/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: item.id, method: 'WALLET' })
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.error?.includes('Insufficient') || data.error === 'INSUFFICIENT_FUNDS') {
                    toast.error('Insufficient wallet balance. Please fund your wallet or pay with Card.');
                } else {
                    toast.error(data.error || 'Checkout failed');
                }
                return;
            }

            toast.success('Funds locked in Escrow! 🎉');
            setStep(2);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error('Purchase error:', err);
            toast.error(err.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (showReview) {
        return (
            <ReviewModal 
                sellerId={item.seller_id}
                itemId={item.id}
                buyerName={userProfile?.full_name || 'Buyer'}
                onClose={onClose}
                onSuccess={() => {}}
            />
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-white/10 w-full max-w-sm sm:max-w-md mx-auto shadow-2xl relative overflow-hidden">
            <button onClick={onClose} className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors z-10">
                <X className="w-5 h-5" />
            </button>

            <div className="p-5 sm:p-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
                {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className="flex items-center gap-2 mb-5 pr-10">
                            <div className="p-2.5 bg-[#BEF264]/10 rounded-xl shrink-0">
                                <ShieldCheck className="w-5 h-5 text-[#BEF264]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-lg sm:text-xl text-gray-900 dark:text-white uppercase tracking-tight truncate">Secure Checkout</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">HostelPulse Escrow Protected</p>
                            </div>
                        </div>

                        {/* Price summary card */}
                        <div className="space-y-3 mb-6 bg-gray-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate max-w-[200px]">{item.title}</span>
                                <span className="font-black text-gray-900 dark:text-white">₦{Number(item.price).toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">Escrow Protection Fee</span>
                                    <Info size={11} className="text-[#0D9488]" />
                                </div>
                                <span className="font-bold text-[#0D9488] text-xs">₦{serviceFee.toLocaleString()}</span>
                            </div>

                            <div className="h-px bg-neutral-200 dark:bg-white/10 my-1" />

                            <div className="flex justify-between items-center pt-1">
                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Total to Pay</span>
                                <span className="text-xl sm:text-2xl font-black text-black dark:text-[#BEF264]">₦{total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('wallet')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                    paymentMethod === 'wallet' 
                                        ? 'border-[#BEF264] bg-[#BEF264]/10 text-gray-900 dark:text-white' 
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-[#BEF264]/50'
                                }`}
                            >
                                <Wallet className={`w-5 h-5 mb-1 ${paymentMethod === 'wallet' ? 'text-[#BEF264]' : 'text-gray-400'}`} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Pay from Wallet</span>
                                <span className="text-[9px] font-bold text-gray-400 mt-0.5">Bal: ₦{walletBalance.toLocaleString()}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                    paymentMethod === 'card' 
                                        ? 'border-[#BEF264] bg-[#BEF264]/10 text-gray-900 dark:text-white' 
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-[#BEF264]/50'
                                }`}
                            >
                                <ShieldCheck className={`w-5 h-5 mb-1 ${paymentMethod === 'card' ? 'text-[#BEF264]' : 'text-gray-400'}`} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Card / Bank / OPay</span>
                                <span className="text-[9px] font-bold text-emerald-500 mt-0.5">Flutterwave Secure</span>
                            </button>
                        </div>

                        {/* Inspection safety notice */}
                        <div className="bg-[#BEF264]/5 border border-[#BEF264]/20 p-3.5 rounded-2xl mb-5 flex gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-[#BEF264] shrink-0 mt-0.5" />
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                <strong className="text-gray-900 dark:text-white">Inspect then Scan:</strong> Money is held in Escrow. Only scan the seller's QR code after inspecting the item and confirming you are 100% satisfied.
                            </p>
                        </div>

                        {/* Action buttons */}
                        {paymentMethod === 'wallet' ? (
                            <div className="space-y-2">
                                {!hasEnoughBalance && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-xl mb-2 flex items-start gap-2 text-left">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                                            Insufficient wallet balance (₦{walletBalance.toLocaleString()}). Switch to Card / Bank above or fund your wallet.
                                        </p>
                                    </div>
                                )}
                                <button 
                                    onClick={handleWalletPurchase}
                                    disabled={loading || !hasEnoughBalance}
                                    className="w-full bg-[#BEF264] text-black font-black py-3 rounded-2xl shadow-xl shadow-[#BEF264]/10 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-widest"
                                >
                                    <Wallet className="w-4 h-4" />
                                    <span>{loading ? 'Processing Escrow...' : 'Lock Funds from Wallet'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <FlutterwaveButton 
                                    amount={total}
                                    customerEmail={userProfile?.contact_email || 'student@hostelpulse.app'}
                                    customerName={userProfile?.full_name || 'HostelPulse Buyer'}
                                    customerPhone={userProfile?.phone || ''}
                                    hostelName={item.title}
                                    meta={{
                                        type: 'market',
                                        listing_id: item.id,
                                        seller_id: item.seller_id,
                                        payer_id: userProfile?.id || '',
                                        protection_fee: serviceFee
                                    }}
                                    label="Pay & Lock Funds Securely"
                                    className="w-full bg-[#BEF264] text-black font-black py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] active:scale-[0.98] transition-all shadow-xl"
                                    onSuccess={() => {
                                        toast.success('Funds locked in Escrow! 🎉');
                                        setStep(2);
                                        if (onSuccess) onSuccess();
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-6 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-7 h-7 text-[#BEF264]" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Item Secured!</h3>
                        <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-xs mx-auto">
                            Payment is securely held in Escrow. Contact the seller to arrange physical inspection and pickup. Scan their verification QR code when you meet.
                        </p>
                        <div className="space-y-2 mt-6">
                            <button 
                                onClick={() => setShowReview(true)}
                                className="w-full bg-[#BEF264] text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.01] transition-all"
                            >
                                Leave a Review
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors"
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
