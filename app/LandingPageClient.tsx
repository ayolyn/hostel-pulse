"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Search, ChevronRight, MapPin, ShieldCheck, Edit3, UserPlus, PhoneCall, CheckCircle } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { WhyHostelPulse } from '@/components/home/WhyHostelPulse';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { FAQSection } from '@/components/home/FAQSection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPageClient({ latestProperties }: { latestProperties: any[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'rent' | 'gig'>('rent');
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        if (activeTab === "rent") router.push('/rent?q=' + searchQuery);
        else router.push('/services?q=' + searchQuery);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white selection:bg-emerald-500/30 selection:text-emerald-500">
            <PublicHeader />
            
            <main className="pb-20 pt-24">
                {/* Formal Sleek Hero Section */}
                <section className="relative pt-12 pb-16 px-6 overflow-hidden flex flex-col items-center min-h-[90vh]">
                    {/* Background glow */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center z-10 max-w-3xl mx-auto w-full flex flex-col items-center"
                    >
                        <h1 className="text-[2.75rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-gray-900 dark:text-white uppercase">
                            Your Campus <br />
                            <span className="text-emerald-500 relative inline-block">
                                Ecosystem.
                                {/* Underline decoration */}
                                <div className="absolute -bottom-2 left-0 right-0 h-2 bg-emerald-500/30 rounded-full" />
                            </span>
                        </h1>
                        
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
                            Ogbomoso's first all-in-one student network. Rent verified hostels, book campus gigs, buy & sell items, and find roommates safely.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
                            <Link 
                                href="/rent"
                                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                Explore Hostels <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link 
                                href="/how-it-works"
                                className="w-full sm:w-auto bg-transparent border-2 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center"
                            >
                                How It Works
                            </Link>
                        </div>

                        {/* Graphic & Search Integration */}
                        <div className="relative w-full max-w-2xl mx-auto mt-4">
                            {/* The "Virtual Hub" Graphic */}
                            <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-3xl border border-emerald-500/20 flex flex-col items-center justify-center shadow-2xl overflow-hidden mb-12">
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                                <div className="relative z-10 w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl mb-4">
                                    <Home className="w-12 h-12 text-black" />
                                </div>
                                <div className="relative z-10 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span className="text-white font-bold tracking-widest uppercase text-sm">Virtual Hub</span>
                                </div>
                            </div>

                            {/* Sleek Search Bar */}
                            <div className="absolute -bottom-6 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2 transform translate-y-1/2">
                                <div className="flex flex-1 p-1 bg-gray-50 dark:bg-black/50 rounded-xl">
                                    <button
                                        onClick={() => setActiveTab('rent')}
                                        className={"relative flex-1 py-3 rounded-lg text-xs font-bold transition-all " + (activeTab === 'rent' ? "text-white" : "text-gray-500")}
                                    >
                                        {activeTab === 'rent' && (
                                            <motion.div layoutId="active-tab" className="absolute inset-0 bg-gray-900 dark:bg-white/10 rounded-lg" />
                                        )}
                                        <span className="relative z-10 flex items-center justify-center gap-2"><Home className="w-4 h-4"/> Rent</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('gig')}
                                        className={"relative flex-1 py-3 rounded-lg text-xs font-bold transition-all " + (activeTab === 'gig' ? "text-white" : "text-gray-500")}
                                    >
                                        {activeTab === 'gig' && (
                                            <motion.div layoutId="active-tab" className="absolute inset-0 bg-gray-900 dark:bg-white/10 rounded-lg" />
                                        )}
                                        <span className="relative z-10 flex items-center justify-center gap-2"><Zap className="w-4 h-4"/> Gig</span>
                                    </button>
                                </div>
                                <div className="flex items-center flex-1 bg-gray-50 dark:bg-black/50 rounded-xl px-4 py-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 font-medium focus:outline-none text-sm py-2"
                                        placeholder={activeTab === 'rent' ? "Search LAUTECH..." : "What gig do you need?"}
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-bold uppercase tracking-widest rounded-xl px-6 py-4 md:py-0 transition-all text-xs flex items-center justify-center"
                                >
                                    Search <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <div className="mt-20">
                    <WhyHostelPulse />
                </div>
                
                <div className="mt-10">
                    <FeaturedListings />
                </div>
                
                <FAQSection />
            </main>
        </div>
    );
}
