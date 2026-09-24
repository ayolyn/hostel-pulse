'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, X, Wallet, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import FlutterwaveButton from '@/components/ui/FlutterwaveButton';

interface EscrowCheckoutModalProps {
    item: {
        id: string;
        title: string;
        price: number;
        seller_id: string;
    };
    onClose: () => void;
    onSuccess: () => void;
}

export function EscrowCheckoutModal({ item, onClose, onSuccess }: EscrowCheckoutModalProps) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
    const [userProfile, setUserProfile] = useState<any>(null);
    const supabase = createClient();
    
    // Calculate service fee
    let serviceFee = 1000;
    if (item.price < 20000) serviceFee = 500;
    else if (item.price > 50000) serviceFee = Math.floor(item.price * 0.025);
    const totalCost = Number(item.price) + serviceFee;

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setUserProfile(data);
            }
        };
        fetchUser();
    }, [supabase]);

    const handleLockFundsWallet = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const res = await fetch('/api/market/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: item.id, user_id: user.id, method: 'WALLET' })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'INSUFFICIENT_FUNDS' || data.error?.includes('Insufficient')) {
                    toast.error('Insufficient funds. Please fund your wallet or pay with Card.');
                } else {
                    toast.error(data.error || 'Checkout failed');
                }
                return;
            }

            toast.success('Funds Locked in Escrow!');
            onSuccess();
        } catch (error: any) {
            console.error('Checkout Error:', error);
            toast.error(error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 relative p-5"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-900 dark:text-white" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-[#BEF264]/20 rounded-2xl">
                        <ShieldCheck className="w-6 h-6 text-[#BEF264]" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Secure Checkout</h2>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-2xl mb-4">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest truncate">{item.title}</p>
                    <div className="flex justify-between items-end mt-1">
                        <div>
                            <p className="text-xs text-gray-400">Price: ₦{Number(item.price).toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Fee: ₦{serviceFee.toLocaleString()}</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#BEF264]">₦{totalCost.toLocaleString()}</p>
                    </div>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => setPaymentMethod('wallet')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                            paymentMethod === 'wallet' 
                            ? 'border-[#BEF264] bg-[#BEF264]/10 text-gray-900 dark:text-white' 
                            : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-[#BEF264]/50'
                        }`}
                    >
                        <Wallet className={`w-6 h-6 mb-2 ${paymentMethod === 'wallet' ? 'text-[#BEF264]' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pay from Wallet</span>
                        {userProfile && (
                            <span className="text-[9px] font-bold text-gray-400 mt-1">Bal: ₦{Number(userProfile.wallet_balance || 0).toLocaleString()}</span>
                        )}
                    </button>

                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                            paymentMethod === 'card' 
                            ? 'border-[#BEF264] bg-[#BEF264]/10 text-gray-900 dark:text-white' 
                            : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-[#BEF264]/50'
                        }`}
                    >
                        <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'card' ? 'text-[#BEF264]' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pay via Card/Bank</span>
                        <span className="text-[9px] font-bold text-emerald-500 mt-1">Flutterwave Secure</span>
                    </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
                    This amount will be locked in Escrow until you receive and verify the item.
                </p>

                {paymentMethod === 'wallet' ? (
                    <button 
                        onClick={handleLockFundsWallet}
                        disabled={loading}
                        className="w-full bg-[#BEF264] text-black py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Lock Funds Securely'}
                    </button>
                ) : (
                    <FlutterwaveButton
                        amount={totalCost}
                        customerEmail={userProfile?.contact_email || 'student@hostelpulse.app'}
                        customerName={userProfile?.full_name || 'HostelPulse Student'}
                        customerPhone={userProfile?.phone || ''}
                        hostelName={item.title} // Reusing this for item title in checkout modal
                        meta={{ 
                            type: 'market', 
                            listing_id: item.id, 
                            seller_id: item.seller_id,
                            payer_id: userProfile?.id,
                            protection_fee: serviceFee
                        }}
                        onSuccess={() => {
                            toast.success('Funds Locked in Escrow!');
                            onSuccess();
                        }}
                        label="Pay & Lock Funds Securely"
                        className="w-full bg-[#BEF264] text-black py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] active:scale-[0.98] transition-all shadow-xl"
                    />
                )}
            </div>
        </div>
    );
}
