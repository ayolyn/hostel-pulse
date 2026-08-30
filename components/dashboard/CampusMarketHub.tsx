'use client';

import React from 'react';
import { ShieldCheck, Rocket, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function CampusMarketHub() {
    const handleNotify = () => {
        toast.success("You will be notified when the Campus Market goes live!", {
            style: {
                background: '#BEF264',
                color: '#000',
                fontWeight: 'bold',
            },
            iconTheme: {
                primary: '#000',
                secondary: '#BEF264',
            },
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#BEF264] rounded-full blur-[100px] opacity-10 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Campus Market</h1>
                    <p className="text-gray-500 font-bold text-sm mt-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#BEF264]" />
                        The secure student marketplace is currently under development.
                    </p>
                </div>
                <button 
                    onClick={handleNotify}
                    className="relative z-10 flex items-center justify-center gap-2 bg-[#BEF264] text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Bell className="w-4 h-4" />
                    Notify Me
                </button>
            </div>

            {/* Under Development Card */}
            <div className="flex items-center justify-center p-12 sm:p-24 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#BEF264] rounded-full blur-[120px] opacity-20 pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
                    <div className="w-24 h-24 mb-8 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 dark:shadow-white/10 group transition-transform duration-500 hover:scale-105">
                        <Rocket className="w-12 h-12 text-[#BEF264] group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-300" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight leading-tight">
                        Marketplace Launching in Phase 2
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        We are currently perfecting the core Hostel Escrow experience. Stay tuned!
                    </p>
                </div>
            </div>
        </div>
    );
}
