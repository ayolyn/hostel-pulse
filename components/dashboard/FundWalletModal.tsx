"use client";

import React, { useState } from "react";
import { XCircle, Wallet, Loader2 } from "lucide-react";
import { initializeOpayPayment } from "@/app/actions/opay";
import toast from "react-hot-toast";

interface FundWalletModalProps {
    userId: string;
    onClose: () => void;
}

export function FundWalletModal({ userId, onClose }: FundWalletModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleFund = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const numAmount = Number(amount);
        if (!numAmount || numAmount < 100) {
            toast.error("Minimum funding amount is ₦100");
            return;
        }

        setIsLoading(true);

        try {
            const res = await initializeOpayPayment(numAmount);
            if (res.error) {
                toast.error(res.error);
                setIsLoading(false);
            } else if (res.cashierUrl) {
                // Redirect to OPay checkout
                window.location.href = res.cashierUrl;
            }
        } catch (err: any) {
            console.error(err);
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md p-5 relative shadow-2xl">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                    <XCircle className="w-5 h-5 text-gray-500" />
                </button>
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Fund Wallet</h3>
                    <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Pay Securely with OPay</p>
                </div>
                
                <form onSubmit={handleFund} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Amount (₦)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black">₦</span>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl text-lg font-black text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                                min="100"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || !amount || Number(amount) < 100}
                        className="w-full bg-blue-600 text-white font-black py-3 rounded-2xl uppercase tracking-widest text-xs hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proceed to Checkout'}
                    </button>
                </form>
            </div>
        </div>
    );
}
