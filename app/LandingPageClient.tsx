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
            
            <main className="pb-20 pt-24">
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 px-6 overflow-hidden flex flex-col items-center min-h-[90vh]">
                    {/* Background glow */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[300px] bg-[#BEF264]/10 blur-[100px] rounded-full pointer-events-none" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, staggerChildren: 0.2 }}
                        className="text-center z-10 max-w-4xl mx-auto w-full flex flex-col items-center"
                    >
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-gray-900 dark:text-white"
                        >
                            Find Your Next Hostel in Ogbomoso — <br className="hidden md:block" />
                            <span className="text-[#BEF264] relative inline-block mt-2">
                                Without the Agent Stress.
                            </span>
                        </motion.h1>
                        
                        <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                            See real rooms, compare prices, find roommates, and connect with trusted listings around LAUTECH.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-6">
                            <Link 
                                href="/rent"
                                className="w-full sm:w-auto bg-[#BEF264] hover:bg-[#d9f99d] text-black px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-[#BEF264]/20 flex items-center justify-center gap-2"
                            >
                                Find a Hostel <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link 
                                href="/dashboard"
                                className="w-full sm:w-auto bg-transparent border-2 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center"
                            >
                                List a Property
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-16">Built for students in Ogbomoso. Starting with housing.</p>

                        {/* Search Integration */}
                        <div className="w-full max-w-2xl mx-auto mt-4 z-20">
                            {/* Redesigned Search Component */}
                            <div className="w-full mx-auto px-4 md:px-0">
                                {/* Main Search Card */}
                                <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 shadow-2xl border border-gray-100 dark:border-white/5 relative z-10 text-left">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Where do you want to live?</h3>
                                        <p className="text-sm text-gray-500">Search Under-G, Stadium, Adenike...</p>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-3">
                                        <div className="flex-1 w-full flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-4">
                                            <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 font-bold text-base focus:outline-none"
                                                placeholder="Area or landmark..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleSearch}
                                            className="w-full md:w-auto bg-black dark:bg-[#BEF264] hover:bg-gray-900 dark:hover:bg-[#d9f99d] text-white dark:text-black font-black px-8 py-4 rounded-2xl transition-all"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Strip */}
                        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm md:text-base font-bold text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#BEF264]" /> Real listings</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-2"><PlaySquare className="w-4 h-4 text-[#BEF264]" /> Raw walkthroughs</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#BEF264]" /> Ogbomoso-focused</span>
                        </div>
                    </motion.div>
                </section>

                <div className="mt-10">
                    <FeaturedListings />
                </div>

                <div className="mt-20">
                    <WhyHostelPulse />
                </div>

                {/* More than a hostel listing section */}
                <section className="py-24 bg-white dark:bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">More than a hostel listing.</h2>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-16">
                            HostelPulse is becoming the place students use to find what they need around campus. <br/> <span className="font-bold text-[#BEF264] dark:text-[#BEF264] bg-black px-2 py-1 rounded mt-4 inline-block">But housing is where we start.</span>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-50 dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer">
                                <div className="w-16 h-16 bg-[#BEF264]/20 rounded-full flex items-center justify-center mb-4">
                                    <Home className="w-8 h-8 text-black dark:text-[#BEF264]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Find a place</h3>
                                <p className="text-gray-500 text-sm">Verified accommodation</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Find people</h3>
                                <p className="text-gray-500 text-sm">Roommates</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer">
                                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                                    <Zap className="w-8 h-8 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Find opportunities</h3>
                                <p className="text-gray-500 text-sm">Campus gigs</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer">
                                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                                    <Store className="w-8 h-8 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Buy & sell</h3>
                                <p className="text-gray-500 text-sm">Student marketplace</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Section - Ogbomoso First */}
                <section className="py-20 bg-gray-900 text-white dark:bg-[#111]">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">One platform. One city. Built around student life.</h2>
                        <p className="text-lg md:text-xl text-gray-400 font-medium">
                            Start with a place to live. Then find the people, opportunities, and things you need around you.
                        </p>
                    </div>
                </section>

                <FAQSection />

                {/* Final CTA */}
                <section className="py-24 bg-white dark:bg-[#0a0a0a]">
                    <div className="max-w-4xl mx-auto px-6 text-center border-t border-gray-200 dark:border-white/10 pt-24">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Looking for a place in Ogbomoso?</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 font-medium">
                            Don't start with an agent. Start with HostelPulse.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                href="/rent"
                                className="w-full sm:w-auto bg-[#BEF264] hover:bg-[#d9f99d] text-black px-10 py-5 rounded-full font-black text-sm tracking-widest uppercase transition-all shadow-lg"
                            >
                                Explore Hostels
                            </Link>
                            <Link 
                                href="/dashboard"
                                className="w-full sm:w-auto bg-transparent border-2 border-gray-200 dark:border-white/10 hover:border-gray-300 text-gray-900 dark:text-white px-10 py-5 rounded-full font-black text-sm tracking-widest uppercase transition-all"
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
