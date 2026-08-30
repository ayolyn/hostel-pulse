"use client";
export const runtime = 'edge';

import React from 'react';
import {
    Zap,
    ShieldCheck,
    DollarSign,
    Users,
    ChevronRight,
    CheckCircle2,
    TrendingUp,
    MapPin,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

const BecomeAgentPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-black text-white">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black" />

                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#BEF264]/10 text-[#BEF264] text-[10px] font-black uppercase tracking-widest border border-[#BEF264]/20">
                        <span className="w-2 h-2 rounded-full bg-[#BEF264] shadow-[0_0_10px_#BEF264]" />
                        Now Hiring in Ogbomoso
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
                        Turn Ogbomoso <br />
                        <span className="text-[#BEF264]">into your Office.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Earn up to ₦150k monthly as a verified HOSTELPULSE Agent. No experience needed—just your phone and hustle.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
                        <Link href="/join?role=Business" className="bg-[#BEF264] text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-[#BEF264]/20 flex items-center gap-3">
                            Apply Now <ChevronRight className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-12 py-6 rounded-[2rem] border border-white/20 font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            How it works
                        </button>
                    </div>
                </div>
            </section>

            {/* Income Stats */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 flex flex-col justify-between">
                        <TrendingUp className="w-12 h-12 text-[#BEF264] mb-8" />
                        <div>
                            <h3 className="text-4xl font-black text-gray-900 mb-2">₦50,000</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Avg. Commission per House</p>
                        </div>
                    </div>
                    <div className="p-10 bg-black text-white rounded-[3rem] flex flex-col justify-between shadow-2xl">
                        <Users className="w-12 h-12 text-[#BEF264] mb-8" />
                        <div>
                            <h3 className="text-4xl font-black text-white mb-2">500+</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Active Agents in Ogbomoso</p>
                        </div>
                    </div>
                    <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 flex flex-col justify-between">
                        <ShieldCheck className="w-12 h-12 text-[#BEF264] mb-8" />
                        <div>
                            <h3 className="text-4xl font-black text-gray-900 mb-2">₦2,000</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Per Inspection (Immediate Payout)</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section id="how-it-works" className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter text-center mb-16">Choose your Hustle</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-20 h-20 bg-[#BEF264]/10 rounded-[2.5rem] flex items-center justify-center text-[#BEF264] group-hover:bg-[#BEF264] group-hover:text-black transition-all">
                                    <MapPin className="w-10 h-10" />
                                </div>
                                <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Verified Inspector</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">The Inspector</h3>
                            <p className="text-gray-500 font-medium leading-relaxed mb-10">
                                Don't own a house? No problem. Use your knowledge of Under-G or Adenike to handle inspection tours for busy landlords. Earn ₦2,000 for every tour.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {['Zero land-lord stress', 'Work whenever you want', 'Instant wallet payouts'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#BEF264]" />
                                        <span className="font-bold text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/join" className="inline-flex items-center gap-2 text-black font-black uppercase tracking-widest text-xs border-b-2 border-black pb-1">
                                Start Inspecting <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-20 h-20 bg-gray-100 rounded-[2.5rem] flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-[#BEF264] transition-all">
                                    <DollarSign className="w-10 h-10" />
                                </div>
                                <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Finder's Fee</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">The Finder</h3>
                            <p className="text-gray-500 font-medium leading-relaxed mb-10">
                                Know a house in General or Takie? Refer the landlord to HOSTELPULSE. If we list and rent the property, we pay you 10% of our commission.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {['Earn while you sleep', 'Support LAUTECH housing', 'Unlimited referrals'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#BEF264]" />
                                        <span className="font-bold text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/join" className="inline-flex items-center gap-2 text-black font-black uppercase tracking-widest text-xs border-b-2 border-black pb-1">
                                Refer a Landlord <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ / Simple CTA */}
            <section className="py-32 px-6 text-center">
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-8">
                    Ogbomoso is waiting. <br />
                    <span className="text-gray-400">Ready to earn?</span>
                </h2>
                <Link href="/join" className="bg-black text-[#BEF264] px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-2xl flex items-center gap-4 mx-auto w-fit">
                    Join the Agent Force <Zap className="w-6 h-6 fill-current" />
                </Link>
            </section>
        </div>
    );
};

export default BecomeAgentPage;
