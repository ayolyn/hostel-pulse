"use client";

import React, { useState } from 'react';
import { ShieldCheck, Scale, FileText, CheckCircle2, X } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    userType: 'agent' | 'landlord' | 'student';
}

export function TermsModal({ isOpen, onClose, onAccept, userType }: TermsModalProps) {
    if (!isOpen) return null;

    const [hasReadToBottom, setHasReadToBottom] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            setHasReadToBottom(true);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-neutral-100 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#BEF264] rounded-2xl flex items-center justify-center shadow-lg shadow-[#BEF264]/20">
                            <Scale className="text-black w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Professional Terms</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Verification & Safety Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div 
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar"
                >
                    {/* TL;DR Section */}
                    <div className="bg-[#BEF264]/10 border border-[#BEF264]/20 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-black dark:text-[#BEF264]" />
                            <h3 className="font-black text-sm uppercase text-gray-900 dark:text-[#BEF264]">TL;DR (The Human Version)</h3>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                "No Scams or Duplicate Listings.",
                                "Be on time for inspections.",
                                "Escrow keeps funds safe for both sides.",
                                "Identity is verified for trust.",
                                "Fast response is expected.",
                                "Professional behavior at all times."
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-neutral-300">
                                    <CheckCircle2 className="w-4 h-4 text-[#BEF264] shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Full Terms */}
                    <div className="space-y-6 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 font-medium">
                        <section>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-[10px]">01</span>
                                Identity Verification
                            </h4>
                            <p>
                                By proceeding with verification, you explicitly consent to HOSTELPULSE collecting and processing your government-issued identity documents and biometric data (Selfie). You agree that this information will be used solely for the purpose of verifying your professional status and will be stored securely in our encrypted vaults.
                            </p>
                        </section>

                        <section>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-[10px]">02</span>
                                The Escrow Protocol
                            </h4>
                            <p>
                                You understand that 100% of the rent and relevant fees are held by the HOSTELPULSE Escrow Vault. Funds are only released to the {userType} after the Student confirms move-in or within 48 hours of the scheduled move date (unless a dispute is raised).
                            </p>
                        </section>

                        <section>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-[10px]">03</span>
                                Listing Integrity & Inspection
                            </h4>
                            <p>
                                Every house listed must exist and match the photos provided. You agree that our field team may physically inspect any property you list. If a student pays an inspection fee and you fail to appear or provide access, you understand that your account will be immediately flagged and your wallet balance may be withheld as compensation.
                            </p>
                        </section>

                        <section>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-[10px]">04</span>
                                User & Data Shield
                            </h4>
                            <p>
                                Fraudulent activity, scamming, or providing false university credentials will result in a permanent ban across all portals. HOSTELPULSE acts as a neutral trust layer; you acknowledge that we are not liable for property damages, though we will assist in arbitration through our legal panel.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer / Accept Action */}
                <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <div className="flex flex-col gap-4">
                        {!hasReadToBottom && (
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#BEF264] bg-black dark:bg-white/5 py-4 rounded-2xl">
                                <FileText className="w-4 h-4" />
                                Please scroll to the bottom to accept
                            </div>
                        )}
                        <button
                            disabled={!hasReadToBottom}
                            onClick={onAccept}
                            className={`
                                w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl
                                ${hasReadToBottom 
                                    ? 'bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black hover:scale-[1.02] active:scale-95' 
                                    : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed opacity-50'
                                }
                            `}
                        >
                            I Accept & Comply with Terms
                        </button>
                        <p className="text-[9px] text-center font-bold text-gray-400 uppercase tracking-widest">
                            By clicking accept, you create a legally binding agreement between yourself and THE HOSTELPULSE HQ.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
