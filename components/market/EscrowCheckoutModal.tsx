'use client';

import { useState } from 'react';
import { ShieldCheck, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface EscrowCheckoutModalProps {
    item: {
        id: string;
        title: string;
        price: number;
        seller_id: string;
    };
    onClose: () => void;
    onSuccess: (purchasedItemId: string) => void;
}

export function EscrowCheckoutModal({ item, onClose, onSuccess }: EscrowCheckoutModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!item) return null;

    // Logic: Fridges are ₦1,000 flat. Others: ₦500 under 20k, ₦1,000 under 50k, 2.5% above 50k
    let serviceFee = 1000;
    if ((item?.title || '').toLowerCase().includes('fridge')) {
        serviceFee = 1000;
    } else if (item.price < 20000) {
        serviceFee = 500;
    } else if (item.price > 50000) {
        serviceFee = Math.floor(item.price * 0.025);
    }
    const total = Number(item.price) + serviceFee;

    const handlePurchase = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/market/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: item.id })
            });
            if (res.ok) {
                toast.success('Funds locked successfully!', {
                    style: { background: '#10B981', color: '#fff' }
                });
                onClose();
                onSuccess(item.id);
            } else {
                const data = await res.json();
                if (data.error === 'INSUFFICIENT_FUNDS') {
                    setError('INSUFFICIENT_FUNDS');
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
        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-[2.5rem] border border-neutral-200 dark:border-white/10 w-full max-w-sm mx-auto shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors z-10">
                <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#BEF264]/20 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-[#BEF264]" />
                </div>
                
                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter mb-6 line-clamp-2">
                    {item.title}
                </h3>
                
                <div className="space-y-4 mb-6 w-full text-left">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.title}</span>
                        <span className="font-black text-gray-900 dark:text-white">₦{item.price.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest">Escrow Protection Fee</span>
                        </div>
                        <span className="font-black text-[#0D9488] text-sm">₦{serviceFee.toLocaleString()}</span>
                    </div>

                    <div className="h-[2px] bg-neutral-100 dark:bg-white/5 mx-2" />

                    <div className="flex justify-between items-center px-4 py-2">
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Total to Pay</span>
                        <span className="text-2xl font-black text-black dark:text-[#BEF264]">₦{total.toLocaleString()}</span>
                    </div>
                </div>

                {error === 'INSUFFICIENT_FUNDS' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 flex items-start gap-3 text-left w-full">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Insufficient Funds! Please fund your wallet to complete this purchase.
                        </p>
                    </div>
                )}

                <div className="bg-gray-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 p-4 rounded-2xl mb-8 w-full text-left">
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed font-bold uppercase tracking-wide">
                        This amount will be safely deducted from your Wallet and locked in HostelPulse Escrow. Funds are only released to the seller once you confirm you have received the item.
                    </p>
                </div>

                <button 
                    onClick={handlePurchase}
                    disabled={loading}
                    className="w-full bg-[#BEF264] text-black font-black py-4 rounded-2xl shadow-xl shadow-[#BEF264]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-[11px]"
                >
                    <ShieldCheck className="w-4 h-4" />
                    {loading ? 'Processing...' : 'Lock Funds Securely'}
                </button>
            </div>
        </div>
    );
}
