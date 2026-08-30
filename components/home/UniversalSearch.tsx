'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Home, Store, Building2, Bed, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { trackSearch } from '@/lib/analytics';

const categories = [
    { id: 'rent', label: 'Rent', icon: Home, placeholder: 'Monthly/Yearly — Search Under-G, Adenike...', color: '#BEF264' },
    { id: 'shortlet', label: 'Shortlet', icon: Bed, placeholder: 'Daily/Weekly — Hotels & Shortlets in Ogbomoso...', color: '#F59E0B' },
    { id: 'shop', label: 'Shops', icon: Store, placeholder: 'Search Takie, General Market...', color: '#0D9488' },
    { id: 'buy', label: 'Buy/Land', icon: Building2, placeholder: 'Search Plots in Aroje...', color: '#3B82F6' },
];

export function UniversalSearch() {
    const [activeTab, setActiveTab] = useState('rent');
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        let path = '/search';
        const params = new URLSearchParams();
        params.set('q', query);

        if (activeTab === 'rent') {
            path = '/rent';
            params.set('category', 'Hostel');
        } else if (activeTab === 'shortlet') {
            params.set('category', 'Hotel');
        } else if (activeTab === 'buy') {
            path = '/buy';
        } else if (activeTab === 'shop') {
            params.set('category', 'Shop');
        }

        // Asynchronously log search intelligence
        trackSearch({
            search_term: query,
            category: activeTab,
        });

        router.push(`${path}?${params.toString()}`);
    };

    const currentCategory = categories.find(c => c.id === activeTab);

    return (
        <div className="w-full max-w-4xl mx-auto mt-10 relative z-20">
            {/* 1. Category Tabs */}
            <div className="flex gap-2 mb-4 ml-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-t-2xl transition-all text-sm font-bold",
                            activeTab === cat.id
                                ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-lg"
                                : "bg-black/10 dark:bg-black/40 text-neutral-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                        )}
                    >
                        <cat.icon size={16} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* 2. Main Search Bar */}
            <motion.form
                onSubmit={handleSearch}
                layout
                className="bg-white dark:bg-neutral-900 rounded-3xl p-2 flex flex-col md:flex-row items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-transparent focus-within:border-[#BEF264] transition-all"
            >
                <div className="flex-1 flex items-center px-6 gap-4 w-full border-b md:border-b-0 md:border-r border-neutral-100 dark:border-white/5">
                    <MapPin className="text-neutral-400 shrink-0" size={24} />
                    <AnimatePresence mode="wait">
                        <motion.input
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={currentCategory?.placeholder}
                            className="w-full h-16 bg-transparent outline-none text-neutral-900 dark:text-white font-semibold text-lg placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                        />
                    </AnimatePresence>
                </div>

                <button
                    type="submit"
                    className="w-full md:w-auto bg-black text-white h-16 px-10 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all m-1 group"
                >
                    SEARCH
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
            </motion.form>

            {/* 3. Real-time Hint */}
            <p className="mt-4 text-neutral-500 text-sm ml-4">
                Popular: <span className="text-neutral-900 dark:text-white font-bold">Under-G Self-con</span>, <span className="text-neutral-900 dark:text-white font-bold">General Market Shops</span>
            </p>
        </div>
    );
}
