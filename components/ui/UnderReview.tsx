"use client";

import React from 'react';
import { ShieldAlert, ShieldCheck, Mail, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';

export function UnderReview() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] dark:opacity-10">
                <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-[#BEF264] rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-lg bg-white/50 dark:bg-[#1E293B]/50 backdrop-blur-2xl p-6 rounded-3xl border border-gray-200 dark:border-white/5 relative z-10 shadow-2xl dark:shadow-none text-center">

                <div className="relative mx-auto w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-2xl" />
                    <div className="relative w-full h-full bg-amber-500/20 rounded-2xl flex items-center justify-center rotate-3 ring-4 ring-amber-500/30">
                        <ShieldAlert className="w-10 h-10 text-amber-500 -rotate-3" />
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending Verification</span>
                </div>

                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight uppercase italic">
                    HQ Verification Gate
                </h1>

                <p className="text-gray-600 dark:text-gray-400 font-medium mb-8 text-sm">
                    Your KYC documents have been received. HOSTELPULSE Security is currently calculating your <span className="text-[#a6d456] font-black underline decoration-dotted">Trust Rank</span> to ensure you are a certified Ogbomoso professional.
                </p>

                <div className="grid grid-cols-1 gap-3 mb-10 text-left">
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-[#BEF264]/20 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5 text-teal-500" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-tight">Security Review</h4>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase leading-relaxed">We verify your CAC & ID to prevent student scams in Under-G.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-[#BEF264]/20 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-[#BEF264]/10 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 text-[#a6d456]" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-tight">Trust Rank: Pending</h4>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase leading-relaxed">Your Bronze, Silver, or Gold rank will be assigned upon approval.</p>
                        </div>
                    </div>
                </div>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-all bg-black px-8 py-4 rounded-full"
                >
                    Exit to Home
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
