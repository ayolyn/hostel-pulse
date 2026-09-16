'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, ChevronDown, SlidersHorizontal, X, Map as MapIcon, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackSearch } from '@/lib/analytics';

export function PropertyFilterBar({ mode = 'buy', basePath }: { mode?: 'buy' | 'rent', basePath?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resolvedBasePath = basePath || (mode === 'rent' ? '/rent' : '/buy');

    // Local state for filter values
    const [filters, setFilters] = useState({
        q: searchParams.get('q') || '',
        category: searchParams.get('category') || 'All Categories',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        zone: searchParams.get('zone') || 'All Zones',
        amenity: searchParams.get('amenity') || 'Any',
    });
    const viewMode = searchParams.get('view') || 'list';

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync from URL changes
    useEffect(() => {
        setFilters({
            q: searchParams.get('q') || '',
            category: searchParams.get('category') || 'All Categories',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            bedrooms: searchParams.get('bedrooms') || '',
            zone: searchParams.get('zone') || 'All Zones',
            amenity: searchParams.get('amenity') || 'Any',
        });
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const updateURL = (newFilters: typeof filters) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'All Categories' && value !== 'All Zones' && value !== 'Any') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        
        // Track the search in background without delaying navigation
        trackSearch({
            search_term: newFilters.q || undefined,
            category: newFilters.category !== 'All Categories' ? newFilters.category : undefined,
            min_budget: newFilters.minPrice ? Number(newFilters.minPrice) : undefined,
            max_budget: newFilters.maxPrice ? Number(newFilters.maxPrice) : undefined,
            location: newFilters.zone !== 'All Zones' ? newFilters.zone : undefined
        });

        const baseUrl = resolvedBasePath;
        router.push(`${baseUrl}?${params.toString()}`, { scroll: false });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateURL(filters);
    };

    const toggleView = (v: 'list' | 'map') => {
        const params = new URLSearchParams(searchParams.toString());
        if (v === 'map') params.set('view', 'map');
        else params.delete('view');
        const baseUrl = resolvedBasePath;
        router.push(`${baseUrl}?${params.toString()}`, { scroll: false });
    };

    const categoryOptions = mode === 'rent' 
        ? ['All Categories', 'Self-Con', 'Single Room', 'Room & Parlour', 'Hostel', 'Apartment', 'Shortlet']
        : ['All Categories', 'Hostel', 'House', 'Flat', 'Shop', 'Land', 'Hotel', 'Office'];

    return (
        <div className={`sticky top-20 z-40 transition-all duration-300 ${isScrolled ? 'px-0' : 'px-0'}`}>
            <div className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 shadow-2xl shadow-black/5 mx-auto transition-all duration-300 ${isScrolled ? 'rounded-none sm:rounded-[2rem] max-w-7xl' : 'rounded-[2rem] sm:rounded-[2.5rem] max-w-[1400px]'}`}>
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-3 w-full">
                    
                    {/* Top row controls (View Toggle + Search Bar on mobile) */}
                    <div className="flex items-center gap-3 w-full lg:w-auto lg:flex-1">
                        {/* Map/List Toggle */}
                        <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-2xl p-1 shrink-0">
                            <button
                                type="button"
                                onClick={() => toggleView('list')}
                                className={cn(
                                    "p-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                    viewMode === 'list' ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                )}
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden sm:inline">List</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleView('map')}
                                className={cn(
                                    "p-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                    viewMode === 'map' ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                )}
                            >
                                <MapIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Map</span>
                            </button>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#BEF264] transition-colors" />
                            <input
                                type="text"
                                name="q"
                                value={filters.q}
                                onChange={handleInputChange}
                                placeholder="Area, hostel or keyword..."
                                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#BEF264] rounded-2xl outline-none font-bold text-xs sm:text-sm transition-all text-neutral-900 dark:text-white min-w-0"
                            />
                        </div>
                    </div>

                    {/* Middle row controls on mobile / inline on desktop */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 w-full lg:w-auto">
                        
                        <div className="flex flex-row items-center gap-3">
                            {/* Zone Dropdown */}
                            <div className="relative group flex-1 min-w-0">
                                <select
                                    name="zone"
                                    value={filters.zone}
                                    onChange={handleInputChange}
                                    className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#BEF264] rounded-2xl outline-none font-bold text-xs sm:text-sm transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    <option>All Zones</option>
                                    <option>Under-G</option>
                                    <option>Adenike</option>
                                    <option>Aroje</option>
                                    <option>Yoaco</option>
                                    <option>General</option>
                                    <option>Stadium</option>
                                </select>
                                <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                            </div>

                            {/* Category Dropdown */}
                            <div className="relative group flex-1 min-w-0">
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleInputChange}
                                    className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#BEF264] rounded-2xl outline-none font-bold text-xs sm:text-sm transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    {categoryOptions.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-3">
                            {/* Price Range */}
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-2xl p-1 border border-transparent flex-1">
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleInputChange}
                                    placeholder="Min ₦"
                                    className="w-full min-w-0 pl-3 sm:pl-4 py-2 sm:py-2.5 bg-transparent outline-none font-bold text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                                />
                                <div className="h-4 w-[1px] bg-neutral-200 dark:bg-white/10 shrink-0" />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleInputChange}
                                    placeholder="Max ₦"
                                    className="w-full min-w-0 pl-3 sm:pl-4 py-2 sm:py-2.5 bg-transparent outline-none font-bold text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                                />
                            </div>

                            {/* Search Button (Mobile Inline or Desktop End) */}
                            <button type="submit" className="bg-black dark:bg-[#BEF264] text-white dark:text-black px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 dark:shadow-[#BEF264]/10 shrink-0">
                                Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}