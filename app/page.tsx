'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Wallet, Search, CheckCircle2, ChevronRight, Droplet, Flame, Shirt, TrendingUp, Sparkles, Navigation } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { WhyHostelPulse } from '@/components/home/WhyHostelPulse';
import { FAQSection } from '@/components/home/FAQSection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState<'rent' | 'service' | 'market'>('rent');

    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        if (activeTab === "rent") router.push(`/rent?q=${searchQuery}`);
        else if (activeTab === "service") router.push(`/services?q=${searchQuery}`);
        else router.push(`/market?q=${searchQuery}`);
    };

    const searchPlaceholders = {
        rent: "Search Under-G, Adenike, Stadium Gate...",
        service: "What do you need? (e.g., Gas, Water, Laundry)...",
        market: "Search for electronics, textbooks, furniture..."
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white selection:bg-[#BEF264]/30 selection:text-[#BEF264]">
            <PublicHeader />
            
            <main className="pb-20">
                {/* 1. Hero Section */}
                <section className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
                    {/* Background Effects */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#BEF264]/10 blur-[120px] rounded-full pointer-events-none" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center z-10 max-w-4xl mx-auto"
                    >
                        

                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
                            Your Entire Campus Life. <br className="hidden md:block" />
                            <span className="text-[#BEF264]">Handled.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            From finding a verified room in Under-G, to getting your gas refilled in minutes. The all-in-one ecosystem for Ogbomoso students.
                        </p>

                        {/* Interactive Tabbed Search */}
                        <div className="max-w-2xl mx-auto w-full">
                            {/* Tabs */}
                            <div className="flex overflow-x-auto p-1 bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl mb-4 w-max max-w-full mx-auto hide-scrollbar">
                                {[
                                    { id: 'rent', label: 'Rent a Room', icon: Home },
                                    { id: 'service', label: 'Book a Service', icon: Zap },
                                    { id: 'market', label: 'Campus Market', icon: Wallet }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                                            activeTab === tab.id ? "text-black" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="active-tab"
                                                className="absolute inset-0 bg-[#BEF264] rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <tab.icon className="w-4 h-4 relative z-10" />
                                        <span className="relative z-10">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Search Bar */}
                            <motion.div 
                                layout
                                className="relative bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-2 flex items-center shadow-xl shadow-gray-200/50 dark:shadow-black/50"
                            >
                                <div className="pl-4 pr-2 text-gray-400">
                                    <Search className="w-6 h-6" />
                                </div>
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()} 
                                    placeholder={searchPlaceholders[activeTab]}
                                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 py-3 sm:py-4 text-base sm:text-lg w-full min-w-0"
                                />
                                <button onClick={handleSearch} className="bg-[#BEF264] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-[#a5d953] transition-colors shrink-0">
                                    GO <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>

                {/* 2. Journey Selector */}
                <section className="px-6 relative z-20 -mt-10 mb-32 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { 
                                title: "Find a Home", 
                                desc: "100% Escrow protected hostel hunting.", 
                                icon: Home, 
                                link: "/explore",
                                color: "text-emerald-400",
                                bg: "bg-emerald-400/10"
                            },
                            { 
                                title: "Campus Services", 
                                desc: "Gas, water, and laundry delivered to your door.", 
                                icon: Zap, 
                                link: "/services",
                                color: "text-blue-400",
                                bg: "bg-blue-400/10"
                            },
                            { 
                                title: "Make Money", 
                                desc: "Claim errands or list properties to earn daily.", 
                                icon: Wallet, 
                                link: "/dashboard/agent",
                                color: "text-purple-400",
                                bg: "bg-purple-400/10"
                            }
                        ].map((card, idx) => (
                            <Link href={card.link} key={idx}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm dark:shadow-none hover:border-[#BEF264]/50 hover:bg-white/[0.07] transition-all duration-300 h-full flex flex-col"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6`}>
                                        <card.icon className={`w-7 h-7 ${card.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{card.title}</h3>
                                    <p className="text-gray-400 font-medium leading-relaxed flex-1">{card.desc}</p>
                                    
                                    <div className="mt-8 flex items-center gap-2 text-[#BEF264] font-bold text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        Explore <ChevronRight className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 3. Housing Bento Grid */}
                <div className="mb-32">
                    <WhyHostelPulse />
                </div>

                {/* 4. Micro-Gig Section (Survive Sapa) */}
                <section className="px-6 max-w-6xl mx-auto mb-32">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Survive Sapa. Tap a Button.</h2>
                        <p className="text-gray-400 text-lg max-w-2xl">Get your everyday student needs sorted without leaving your room. Fast, reliable, and run by fellow students.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Service Card 1 */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-[2rem] p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Flame className="w-32 h-32 text-orange-500" />
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold mb-6">
                                <Zap className="w-3.5 h-3.5" /> Fast Delivery
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 relative z-10">12.5kg Gas Refill</h3>
                            <p className="text-gray-400 mb-8 relative z-10">Don't carry heavy cylinders around. We'll pick up, refill, and drop o!.</p>
                            
                            <div className="flex items-end justify-between relative z-10">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Estimated</p>
                                    <p className="text-xl font-black text-[#BEF264]">?12,500 <span className="text-sm text-gray-500 font-medium">/refill</span></p>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>

                        {/* Service Card 2 */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-[2rem] p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shirt className="w-32 h-32 text-blue-500" />
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                                <Navigation className="w-3.5 h-3.5" /> Agent Pickup
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 relative z-10">Wash & Fold Laundry</h3>
                            <p className="text-gray-400 mb-8 relative z-10">Fresh, ironed clothes delivered to your doorstep within 48 hours.</p>
                            
                            <div className="flex items-end justify-between relative z-10">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Starting from</p>
                                    <p className="text-xl font-black text-[#BEF264]">?500 <span className="text-sm text-gray-500 font-medium">/item</span></p>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>

                        {/* Service Card 3 */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-[2rem] p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Droplet className="w-32 h-32 text-cyan-500" />
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold mb-6">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Purified
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 relative z-10">Clean Water Delivery</h3>
                            <p className="text-gray-400 mb-8 relative z-10">Dispenser water delivered straight to your room in Under-G.</p>
                            
                            <div className="flex items-end justify-between relative z-10">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Estimated</p>
                                    <p className="text-xl font-black text-[#BEF264]">?800 <span className="text-sm text-gray-500 font-medium">/bottle</span></p>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 5. The Hustle/Provider CTA */}
                <section className="px-6 max-w-6xl mx-auto mb-32">
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden relative flex flex-col md:flex-row items-center gap-12">
                        {/* Background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#BEF264]/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="flex-1 relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Turn Ogbomoso <br className="hidden sm:block"/>Into Your Office.</h2>
                            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                                Claim campus errands, run deliveries, or list verified properties to earn daily payouts straight to your wallet. Work on your own schedule.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/register/agent" className="bg-[#BEF264] text-black px-8 py-4 rounded-2xl font-black text-center hover:bg-[#a5d953] transition-colors shadow-[0_0_40px_rgba(190,242,100,0.3)]">
                                    Become a Runner
                                </Link>
                                <Link href="/register/agent" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-center transition-colors backdrop-blur-md">
                                    Register as Agent
                                </Link>
                            </div>
                        </div>

                        <div className="flex-1 relative z-10 w-full">
                            {/* Abstract Illustration */}
                            <div className="relative w-full max-w-md mx-auto aspect-square">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#BEF264]/20 to-transparent rounded-full animate-pulse blur-2xl" />
                                
                                {/* Mockup Card 1 */}
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="absolute top-10 right-10 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl w-64 shadow-2xl"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Payout Ready</p>
                                            <p className="text-xl font-black text-white">?45,000</p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 w-3/4 rounded-full" />
                                    </div>
                                </motion.div>

                                {/* Mockup Card 2 */}
                                <motion.div 
                                    initial={{ y: -20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute bottom-10 left-10 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl w-72 shadow-2xl"
                                >
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Recent Gigs</p>
                                    <div className="space-y-4">
                                        {[
                                            { name: "Gas Delivery (Under-G)", price: "+?1,500" },
                                            { name: "Apartment Inspection", price: "+?2,000" }
                                        ].map((gig, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4 text-[#BEF264]" />
                                                    </div>
                                                    <p className="text-sm font-bold text-white">{gig.name}</p>
                                                </div>
                                                <p className="text-sm font-black text-emerald-400">{gig.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                <FAQSection />
            </main>
        </div>
    );
}
