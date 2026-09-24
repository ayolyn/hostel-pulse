"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import FlutterwaveButton from "@/components/ui/FlutterwaveButton";

interface FundWalletModalProps {
    userId: string;
    onClose: () => void;
}

export function FundWalletModal({ userId, onClose }: FundWalletModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [userProfile, setUserProfile] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
            setUserProfile(data);
        };
        fetchUser();
    }, [supabase, userId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <XCircle className="w-6 h-6" />
                </button>

                <div className="p-8 border-b border-gray-100 dark:border-white/5 text-center">
                    <div className="w-16 h-16 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-[#BEF264]" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Fund Wallet</h2>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">₦</span>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none focus:border-[#BEF264] transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[5000, 20000, 50000].map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val.toString())}
                                className="py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-black text-gray-900 dark:text-white uppercase hover:border-[#BEF264] hover:bg-[#BEF264]/5 transition-all"
                            >
                                ₦{val.toLocaleString()}
                            </button>
                        ))}
                    </div>

                    {(!amount || Number(amount) < 100) ? (
                        <button 
                            disabled
                            className="w-full bg-gray-200 dark:bg-white/5 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all"
                        >
                            Enter min ₦100 to Proceed
                        </button>
                    ) : (
                        <FlutterwaveButton
                            amount={Number(amount)}
                            customerEmail={userProfile?.contact_email || 'user@hostelpulse.com'}
                            customerName={userProfile?.full_name || 'HostelPulse User'}
                            customerPhone={userProfile?.phone || ''}
                            hostelName="Wallet Deposit"
                            meta={{ 
                                type: 'deposit',
                                payer_id: userId
                            }}
                            onSuccess={() => {
                                toast.success('Deposit successful!');
                                onClose();
                            }}
                            label="Proceed to Pay"
                            className="w-full bg-[#BEF264] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] active:scale-[0.98] transition-all shadow-xl"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
