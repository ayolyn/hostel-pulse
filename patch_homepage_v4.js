const fs = require('fs');

const pageContent = `\'use client\';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Search, ChevronRight, MapPin, ShieldCheck, Edit3 } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { WhyHostelPulse } from '@/components/home/WhyHostelPulse';
import { FAQSection } from '@/components/home/FAQSection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AnimatedHeroText = () => {
    const phrases = [
        "Find a verified hostel in Under-G.",
        "Get your gas cylinder refilled.",
        "Hire a runner for your laundry.",
        "Zero agent scams. 100% Escrow."
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-8 md:h-10 overflow-hidden relative w-full flex justify-center text-[#BEF264] font-medium text-lg md:text-2xl mt-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute whitespace-nowrap"
                >
                    {phrases[index]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default function LandingPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'rent' | 'gig'>('rent');
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        if (activeTab === "rent") router.push('/rent?q=' + searchQuery);
        else router.push('/services?q=' + searchQuery);
    };

    const searchPlaceholders = {
        rent: "Search Under-G, Adenike, Stadium Gate...",
        gig: "What do you need? (e.g., Gas, Water, Laundry)..."
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white selection:bg-[#BEF264]/30 selection:text-[#BEF264]">
            <PublicHeader />
            
            <main className="pb-20">
                {/* 1. Hero Section with Animation */}
                <section className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#BEF264]/10 blur-[120px] rounded-full pointer-events-none" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center z-10 max-w-4xl mx-auto w-full"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 leading-[1.1]">
                            Your Campus Life. <br className="hidden md:block" />
                            <span className="text-[#BEF264]">Handled.</span>
                        </h1>
                        
                        <AnimatedHeroText />

                        {/* Interactive Tabbed Search */}
                        <div className="max-w-2xl mx-auto w-full mt-12">
                            <div className="flex overflow-x-auto p-1 bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl mb-4 w-max max-w-full mx-auto hide-scrollbar">
                                {[
                                    { id: 'rent', label: 'Rent a Room', icon: Home },
                                    { id: 'gig', label: 'Book a Gig', icon: Zap }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={"relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 " + (activeTab === tab.id ? "text-black" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")}
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

                {/* 2. Journey Selector (2 Columns now, focused on Housing & Gigs) */}
                <section className="px-6 relative z-20 -mt-10 mb-32 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/rent">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 hover:border-emerald-400/50 hover:bg-emerald-50 dark:hover:bg-white/[0.07] transition-all duration-300 h-full flex flex-col shadow-sm dark:shadow-none"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-6">
                                    <Home className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Secure Housing</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed flex-1">100% Escrow protected hostel hunting. Zero risk of agent scams.</p>
                                
                                <div className="mt-8 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Find a Room <ChevronRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        </Link>

                        <Link href="/services">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 hover:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-white/[0.07] transition-all duration-300 h-full flex flex-col shadow-sm dark:shadow-none"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-blue-400/10 flex items-center justify-center mb-6">
                                    <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Campus Gigs</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed flex-1">Hire verified runners for gas, water, laundry, and everyday campus errands.</p>
                                
                                <div className="mt-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Book a Gig <ChevronRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </section>

                {/* 3. Housing Bento Grid */}
                <div className="mb-32">
                    <WhyHostelPulse />
                </div>

                {/* 4. The Gig Ecosystem Visual (Replacing Survive Sapa) */}
                <section className="px-6 max-w-6xl mx-auto mb-32">
                    <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-sm dark:shadow-none">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                                    <Zap className="w-4 h-4" /> The Gig Network
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">Get anything done in minutes.</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                                    Need gas? Too tired to do laundry? Post a gig and a verified student runner will handle it for you. Or, become a runner yourself and get paid directly to your wallet.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        { text: "Post a gig and set your price", icon: Edit3 },
                                        { text: "Runners accept instantly", icon: Zap },
                                        { text: "Payment is held in escrow until done", icon: ShieldCheck }
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-900 dark:text-gray-300 font-medium">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <feature.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/services" className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-8 py-4 rounded-2xl font-bold text-center transition-colors">
                                        Post a Gig
                                    </Link>
                                    <Link href="/register/agent" className="bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-bold text-center transition-colors">
                                        Become a Runner
                                    </Link>
                                </div>
                            </div>

                            {/* Animated Gig Feed */}
                            <div className="flex-1 w-full max-w-md mx-auto relative h-[400px]">
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50 dark:from-[#111] dark:via-transparent dark:to-[#111] z-10 pointer-events-none" />
                                
                                <div className="absolute w-full space-y-4 animate-scroll pt-20">
                                    {[
                                        { title: "12.5kg Gas Refill", location: "Under-G", price: "?1,500", time: "Just now" },
                                        { title: "Laundry Pickup", location: "Adenike", price: "?2,000", time: "2m ago" },
                                        { title: "Print & Deliver Assignment", location: "Stadium Gate", price: "?500", time: "5m ago" },
                                        { title: "Dispenser Water", location: "General", price: "?800", time: "12m ago" },
                                        { title: "12.5kg Gas Refill", location: "Under-G", price: "?1,500", time: "Just now" },
                                    ].map((gig, i) => (
                                        <div key={i} className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 p-4 rounded-2xl shadow-sm flex justify-between items-center transform transition-transform hover:scale-[1.02] cursor-pointer">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{gig.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <MapPin className="w-3 h-3" /> {gig.location} • {gig.time}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-[#BEF264] text-lg">{gig.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <FAQSection />
            </main>
            
            <style jsx global>{\`
                @keyframes scroll {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .animate-scroll {
                    animation: scroll 15s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            \`}</style>
        </div>
    );
}

const Edit3 = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
);
`;

fs.writeFileSync('app/page.tsx', pageContent, 'utf-8');
console.log('Successfully wrote new app/page.tsx');
