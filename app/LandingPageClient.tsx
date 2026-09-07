"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Search, ChevronRight, MapPin, ShieldCheck, Edit3, UserPlus, PhoneCall, CheckCircle, Store, Users } from 'lucide-react';
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
                {/* Formal Sleek Hero Section */}
                <section className="relative pt-12 pb-16 px-6 overflow-hidden flex flex-col items-center min-h-[90vh]">
                    {/* Background glow */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#BEF264]/10 blur-[100px] rounded-full pointer-events-none" />
                    
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
                            className="text-[3rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-gray-900 dark:text-white uppercase"
                        >
                            Your Campus <br />
                            <span className="text-[#BEF264] relative inline-block mt-2">
                                Ecosystem.
                                {/* Underline decoration */}
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                                    className="absolute -bottom-3 left-0 right-0 h-3 bg-[#BEF264]/30 rounded-full" 
                                />
                            </span>
                        </motion.h1>
                        
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
                            Ogbomoso's first all-in-one student network. Rent verified hostels, book campus gigs, buy & sell items, and find roommates safely.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
                            <Link 
                                href="/rent"
                                className="w-full sm:w-auto bg-[#BEF264] hover:bg-[#d9f99d] text-black px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-[#BEF264]/20 flex items-center justify-center gap-2"
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
                        <div className="w-full max-w-3xl mx-auto mt-10 z-20">
                            {/* The "Virtual Hub" Graphic - Moved up and made smaller on mobile so search fits */}
                            <motion.div 
                                animate={{ y: [0, -10, 0], rotate: [0, 1, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative mx-auto w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-[#BEF264]/20 to-transparent rounded-[2rem] border border-[#BEF264]/20 flex flex-col items-center justify-center shadow-2xl overflow-hidden mb-12"
                            >
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                                <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-[#BEF264] rounded-2xl flex items-center justify-center shadow-xl mb-3">
                                    <Home className="w-8 h-8 md:w-10 md:h-10 text-black" />
                                </div>
                                <div className="relative z-10 bg-black/60 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-[#BEF264]" />
                                    <span className="text-white font-bold tracking-widest uppercase text-xs md:text-sm">Virtual Hub</span>
                                </div>
                            </motion.div>

                            {/* Redesigned Search Component */}
                            <div className="w-full max-w-xl mx-auto px-4 md:px-0">
                                {/* External Tabs */}
                                <div className="flex items-end gap-1.5 ml-4 overflow-x-auto no-scrollbar pr-4">
                                    <button
                                        onClick={() => setActiveTab('rent')}
                                        className={"flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'rent' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Home className="w-4 h-4" /> Rent
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('gig')}
                                        className={"flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'gig' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Zap className="w-4 h-4" /> Gig
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('market')}
                                        className={"flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'market' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Store className="w-4 h-4" /> Market
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('roommate')}
                                        className={"flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'roommate' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Users className="w-4 h-4" /> Roommate
                                    </button>
                                </div>

                                {/* Main Search Card */}
                                <div className="bg-white dark:bg-[#111] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-white/5 relative z-10">
                                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
                                        <MapPin className="w-6 h-6 text-gray-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 font-bold text-lg md:text-xl focus:outline-none"
                                            placeholder={
                                                activeTab === 'rent' ? "Monthly/Yearly � Search Under-G..." : 
                                                activeTab === 'gig' ? "Search for laundry, design, etc..." :
                                                activeTab === 'market' ? "Search phones, laptops, books..." :
                                                "Find your ideal roommate..."
                                            }
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        className="w-full bg-black dark:bg-[#BEF264] hover:bg-gray-900 dark:hover:bg-[#d9f99d] text-white dark:text-black font-black text-lg py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center transition-all"
                                    >
                                        Search <ChevronRight className="w-5 h-5 ml-2" />
                                    </button>
                                </div>
                                
                                <div className="mt-4 text-center md:text-left md:ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Popular: 
                                    {activeTab === 'rent' && <span className="text-gray-900 dark:text-white font-bold ml-1">Under-G Self-con, Stadium Shops</span>}
                                    {activeTab === 'gig' && <span className="text-gray-900 dark:text-white font-bold ml-1">Laundry, Web Design</span>}
                                    {activeTab === 'market' && <span className="text-gray-900 dark:text-white font-bold ml-1">iPhone 13, Generators</span>}
                                    {activeTab === 'roommate' && <span className="text-gray-900 dark:text-white font-bold ml-1">Adenike Area, Male Only</span>}
                                </div>
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
