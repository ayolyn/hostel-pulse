'use client';

import { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

interface EscrowCheckoutModalProps {
    item: {
        id: string;
        title: string;
        price: number;
    };
    onClose: () => void;
    onSuccess: () => void;
}

export function EscrowCheckoutModal({ item, onClose, onSuccess }: EscrowCheckoutModalProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleLockFunds = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const res = await fetch('/api/market/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: item.id, user_id: user.id })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'INSUFFICIENT_FUNDS') {
                    toast.error('Insufficient funds. Please fund your wallet.');
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
                className="bg-white dark:bg-neutral-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 relative p-8"
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

                <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-2xl mb-6">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest truncate">{item.title}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-[#BEF264] mt-1">₦{Number(item.price).toLocaleString()}</p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8">
                    This amount will be safely deducted from your Wallet and locked in Escrow until you receive the item.
                </p>

                <button 
                    onClick={handleLockFunds}
                    disabled={loading}
                    className="w-full bg-[#BEF264] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Lock Funds Securely'}
                </button>
            </div>
        </div>
    );
}
