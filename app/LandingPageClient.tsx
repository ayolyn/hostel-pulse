"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Search, ChevronRight, MapPin, ShieldCheck, Edit3, UserPlus, PhoneCall, CheckCircle, Store, Users, PlaySquare } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { WhyHostelPulse } from '@/components/home/WhyHostelPulse';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { FAQSection } from '@/components/home/FAQSection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPageClient({ latestProperties }: { latestProperties: any[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'rent' | 'gig' | 'market' | 'roommate'>('rent');
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        if (activeTab === "rent") router.push('/rent?q=' + searchQuery);
        else if (activeTab === "gig") router.push('/services?q=' + searchQuery);
        else if (activeTab === "market") router.push('/market?q=' + searchQuery);
        else if (activeTab === "roommate") router.push('/roommates?q=' + searchQuery);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white selection:bg-[#BEF264]/30 selection:text-[#BEF264]">
            <PublicHeader />
            
            <main className="pb-8 pt-20 md:pb-12 md:pt-24">
                {/* Hero Section */}
                <section className="relative pt-6 pb-10 md:pt-12 md:pb-12 px-6 flex flex-col items-center">
                    <div className="text-center z-10 max-w-4xl mx-auto w-full flex flex-col items-center">
                        <h1 className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
                            Find Your Next Hostel in Ogbomoso — <br className="hidden md:block" />
                            <span className="text-[#BEF264] relative inline-block">
                                Without the Agent Stress.
                            </span>
                        </h1>
                        
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
                            See real rooms, compare prices, find roommates, and connect with trusted listings around LAUTECH.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-4">
                            <Link 
                                href="/rent"
                                className="w-full sm:w-auto bg-[#BEF264] hover:bg-[#d9f99d] text-black px-8 py-3.5 rounded-xl font-bold text-sm uppercase transition-all flex items-center justify-center gap-2"
                            >
                                Find a Hostel <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link 
                                href="/dashboard"
                                className="w-full sm:w-auto bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase transition-all flex items-center justify-center"
                            >
                                List a Property
                            </Link>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-10 md:mb-12">Built for students in Ogbomoso. Starting with housing.</p>

                        {/* Search Integration */}
                        <div className="w-full max-w-3xl mx-auto z-20">
                            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-5 md:p-8 border border-gray-200 dark:border-white/10 text-left">
                                <div className="mb-5 md:mb-6">
                                    <h3 className="text-xs md:text-sm font-black text-gray-500 tracking-widest uppercase mb-1">Where do you want to live?</h3>
                                </div>
                                <div className="flex flex-col md:flex-row items-stretch gap-3">
                                    <div className="flex-1 w-full flex items-center gap-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 focus-within:border-gray-400 dark:focus-within:border-[#BEF264]/50 transition-colors">
                                        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 font-semibold focus:outline-none text-sm md:text-base"
                                            placeholder="Search an area or landmark... e.g., Under-G"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        className="w-full md:w-auto bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-bold px-8 py-3.5 rounded-xl transition-all whitespace-nowrap"
                                    >
                                        Search
                                    </button>
                                </div>

                                {/* Trust Strip Embedded in Search */}
                                <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-start gap-4 md:gap-6 text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-gray-900 dark:text-white" /> Real Listings</span>
                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                                    <span className="flex items-center gap-1.5"><PlaySquare className="w-4 h-4 text-gray-900 dark:text-white" /> Raw Walkthroughs</span>
                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-900 dark:text-white" /> Ogbomoso-focused</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-6 mb-12 md:mt-8 md:mb-16">
                    <FeaturedListings />
                </div>

                <div className="mt-6 mb-12 md:mt-8 md:mb-16">
                    <WhyHostelPulse />
                </div>

                {/* More than a hostel listing section */}
                <section className="py-10 md:py-16 bg-white dark:bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-10 md:mb-12">
                            <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">More than a hostel listing.</h2>
                            <p className="text-base text-gray-600 dark:text-gray-400 max-w-xl">
                                HostelPulse is becoming the place students use to find what they need around campus. <span className="font-bold text-gray-900 dark:text-white">But housing is where we start.</span>
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Housing Wedge (Dominant) */}
                            <div className="w-full lg:w-1/2 bg-[#BEF264] p-8 md:p-12 rounded-2xl flex flex-col justify-between min-h-[240px] md:min-h-[300px]">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-black/10 rounded-xl flex items-center justify-center mb-4">
                                    <Home className="w-6 h-6 md:w-8 md:h-8 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-4xl font-black text-black mb-1 md:mb-2">Find a place</h3>
                                    <p className="text-black/70 font-medium md:text-lg">Verified student accommodation</p>
                                </div>
                            </div>
                            
                            {/* Secondary Categories */}
                            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 rounded-2xl flex flex-col justify-between min-h-[150px]">
                                    <Users className="w-6 h-6 text-gray-900 dark:text-white mb-4" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Find people</h3>
                                        <p className="text-gray-500 text-sm">Roommates</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 rounded-2xl flex flex-col justify-between min-h-[150px]">
                                    <Zap className="w-6 h-6 text-gray-900 dark:text-white mb-4" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Find opportunities</h3>
                                        <p className="text-gray-500 text-sm">Campus gigs</p>
                                    </div>
                                </div>
                                <div className="sm:col-span-2 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 rounded-2xl flex flex-col justify-between min-h-[150px]">
                                    <Store className="w-6 h-6 text-gray-900 dark:text-white mb-4" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Buy & sell</h3>
                                        <p className="text-gray-500 text-sm">Student marketplace</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Section - Ogbomoso First */}
                <section className="py-10 md:py-16 border-t border-gray-200 dark:border-white/10">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 text-gray-900 dark:text-white tracking-tight">One platform. One city.</h2>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                            Built around student life in Ogbomoso.<br/>
                            <span className="text-gray-400 dark:text-gray-500 mt-2 inline-block">Find a place. Find people. Find opportunities. Buy & sell.</span>
                        </p>
                    </div>
                </section>

                <div className="mt-4 mb-12 md:mt-8 md:mb-16">
                    <FAQSection />
                </div>

                {/* Final CTA */}
                <section className="py-10 md:py-16">
                    <div className="max-w-4xl mx-auto px-6 text-center border-t border-gray-200 dark:border-white/10 pt-12 md:pt-16">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-3 md:mb-4 tracking-tight">Looking for a place in Ogbomoso?</h2>
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 md:mb-8 font-medium">
                            Don't start with an agent. Start with HostelPulse.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                href="/rent"
                                className="w-full sm:w-auto bg-[#BEF264] hover:bg-[#d9f99d] text-black px-8 py-3.5 rounded-xl font-bold text-sm uppercase transition-all"
                            >
                                Explore Hostels
                            </Link>
                            <Link 
                                href="/dashboard"
                                className="w-full sm:w-auto bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase transition-all"
                            >
                                List a Property
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
