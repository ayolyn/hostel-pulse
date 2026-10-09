'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, X, AlertCircle, Wallet, ArrowRight, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import FlutterwaveButton from '@/components/ui/FlutterwaveButton';

interface EscrowCheckoutModalProps {
    item: {
        id: string;
        title: string;
        price: number;
        seller_id: string;
        category?: string;
    };
    onClose: () => void;
    onSuccess: (purchasedItemId: string) => void;
}

export function EscrowCheckoutModal({ item, onClose, onSuccess }: EscrowCheckoutModalProps) {
    const [loading, setLoading] = useState(false);
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

    // Logic: Fridges/Appliances are ₦1,000 flat. Others: ₦500 under 20k, ₦1,000 under 50k, 2.5% above 50k
    let serviceFee = 1000;
    const title = (item?.title || '').toLowerCase();
    const cat = (item?.category || '').toLowerCase();
    if (title.includes('fridge') || cat.includes('appliance')) {
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
            const res = await fetch('/api/market/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: item.id, method: 'WALLET' })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Funds locked in Escrow! 🎉');
                onClose();
                onSuccess(item.id);
            } else {
                if (data.error === 'INSUFFICIENT_FUNDS' || data.error?.includes('Insufficient')) {
                    toast.error('Insufficient wallet balance. Please switch to Card or top up your wallet.');
                } else {
                    toast.error(data.error || 'Checkout failed');
                }
            }
        } catch (err: any) {
            console.error('Purchase error:', err);
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl border border-neutral-200 dark:border-white/10 w-full max-w-sm sm:max-w-md mx-auto shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button 
                onClick={onClose} 
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors z-10 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="p-5 sm:p-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
                <div className="text-center flex flex-col items-center mb-5 px-8">
                    <div className="w-12 h-12 bg-[#BEF264]/20 rounded-2xl flex items-center justify-center mb-3">
                        <ShieldCheck className="w-6 h-6 text-[#BEF264]" />
                    </div>
                    <h3 className="font-black text-lg sm:text-xl text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">
                        {item.title}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        HostelPulse Secure Escrow Checkout
                    </p>
                </div>
                
                {/* Cost summary card */}
                <div className="space-y-3 mb-5 w-full bg-gray-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate max-w-[180px]">{item.title}</span>
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
                        <span className="text-[10px] font-black uppercase tracking-wider">Card / Bank</span>
                        <span className="text-[9px] font-bold text-emerald-500 mt-0.5">Flutterwave Secure</span>
                    </button>
                </div>

                {/* Notice */}
                <div className="bg-[#BEF264]/5 border border-[#BEF264]/20 p-3.5 rounded-2xl mb-5 flex gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#BEF264] shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        <strong className="text-gray-900 dark:text-white">Escrow Guarantee:</strong> Funds are safely locked in HostelPulse Escrow. Only release to seller after inspecting the item in person and confirming satisfaction.
                    </p>
                </div>

                {/* Actions */}
                {paymentMethod === 'wallet' ? (
                    <div className="space-y-2">
                        {!hasEnoughBalance && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-xl mb-2 flex items-start gap-2 text-left">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                                    Insufficient wallet balance (₦{walletBalance.toLocaleString()}). Switch to Card / Bank above or top up your wallet.
                                </p>
                            </div>
                        )}
                        <button 
                            onClick={handleWalletPurchase}
                            disabled={loading || !hasEnoughBalance}
                            className="w-full bg-[#BEF264] text-black font-black py-3 rounded-2xl shadow-xl shadow-[#BEF264]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{loading ? 'Processing...' : 'Lock Funds Securely'}</span>
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
                            className="w-full bg-[#BEF264] text-black font-black py-3 rounded-2xl uppercase tracking-widest text-xs hover:bg-[#a6d456] active:scale-[0.98] transition-all shadow-xl"
                            onSuccess={() => {
                                toast.success('Funds locked in Escrow! 🎉');
                                onClose();
                                onSuccess(item.id);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
