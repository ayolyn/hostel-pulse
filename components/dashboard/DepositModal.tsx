"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Wallet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { initializeOpayPayment } from '@/app/actions/opay';

interface DepositModalProps {
    userId: string;
    onClose: () => void;
    onSuccess: (newBalance: number) => void;
}

export function DepositModal({ userId, onClose, onSuccess }: DepositModalProps) {
    const supabase = createClient();
    const [amount, setAmount] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleQuickSelect = (value: number) => {
        setAmount(value.toString());
    };

    const handleDeposit = async () => {
        const depositAmount = Number(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await initializeOpayPayment(depositAmount);
            
            if (res.error) {
                toast.error(res.error);
                setIsProcessing(false);
            } else if (res.cashierUrl) {
                window.location.href = res.cashierUrl;
            }
        } catch (error: any) {
            console.error('Deposit Error:', error);
            toast.error(error.message || 'Failed to initialize payment');
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-[2rem] sm:rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-[#BEF264]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Fund Your Wallet</h2>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Add funds to secure properties or items</p>
                </div>
                
                <div className="p-6 sm:p-8 space-y-5 sm:space-y-6">
                    <div className="relative">
                        <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-black text-gray-400">₦</span>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 sm:py-6 pl-10 sm:pl-12 pr-4 sm:pr-6 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none focus:border-[#BEF264] transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[10000, 50000, 100000].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleQuickSelect(val)}
                                className="py-2.5 sm:py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] sm:text-xs font-black text-gray-900 dark:text-white uppercase hover:border-[#BEF264] hover:bg-[#BEF264]/5 transition-all"
                            >
                                ₦{val.toLocaleString()}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleDeposit}
                        disabled={isProcessing || !amount || Number(amount) <= 0}
                        className="w-full bg-[#BEF264] disabled:bg-gray-200 dark:disabled:bg-white/5 disabled:text-gray-400 text-black py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-3 hover:bg-[#a6d456] transition-all"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proceed to Pay'}
                    </button>
                </div>
            </div>
        </div>
    );
}
