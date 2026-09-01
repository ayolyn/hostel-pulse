'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, ChevronDown, SlidersHorizontal, X, Map as MapIcon, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackSearch } from '@/lib/analytics';

export function PropertyFilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

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

    const updateURL = (newFilters: typeof filters, newViewMode = viewMode) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'All Categories' && value !== 'All Zones' && value !== 'Any') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        
        if (newViewMode === 'map') {
            params.set('view', 'map');
        } else {
            params.delete('view');
        }

        // Asynchronously log search intelligence
        trackSearch({
            search_term: newFilters.q || undefined,
            category: newFilters.category !== 'All Categories' ? newFilters.category : undefined,
            min_budget: newFilters.minPrice ? Number(newFilters.minPrice) : undefined,
            max_budget: newFilters.maxPrice ? Number(newFilters.maxPrice) : undefined,
        });

        router.push(`?${params.toString()}`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updated = { ...filters, [name]: value };
        setFilters(updated);
        // Update URL immediately for select inputs
        if (name !== 'q') updateURL(updated);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateURL(filters);
    };

    return (
        <div className={cn(
            "w-full z-40 transition-all duration-300",
            isScrolled ? "fixed top-24 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-200 dark:border-white/10 shadow-lg py-3" : "relative py-6"
        )}>
            <div className="max-w-7xl mx-auto px-6">
                <form onSubmit={handleSearchSubmit} className="flex flex-nowrap items-center gap-3 overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2">
                    
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => updateURL(filters, 'list')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                viewMode !== 'map' ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm" : "text-gray-500 hover:text-black dark:hover:text-white"
                            )}
                        >
                            <List className="w-4 h-4" />
                            List
                        </button>
                        <button
                            type="button"
                            onClick={() => updateURL(filters, 'map')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                viewMode === 'map' ? "bg-[#BEF264] text-black shadow-sm" : "text-gray-500 hover:text-black dark:hover:text-white"
                            )}
                        >
                            <MapIcon className="w-4 h-4" />
                            Map
                        </button>
                    </div>

                    {/* Keyword / Area */}
                    <div className="flex-1 min-w-[200px] relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#BEF264] transition-colors" />
                        <input
                            type="text"
                            name="q"
                            value={filters.q}
                            onChange={handleInputChange}
                            placeholder="State, Area or Keywords..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#BEF264] rounded-2xl outline-none font-bold text-sm transition-all text-neutral-900 dark:text-white"
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="relative group min-w-[160px]">
                        <select
                            name="category"
                            value={filters.category}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-10 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#BEF264] rounded-2xl outline-none font-bold text-sm transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option>All Categories</option>
                            <option>Hostel</option>
                            <option>House</option>
                            <option>Flat</option>
                            <option>Shop</option>
                            <option>Land</option>
                            <option>Hotel</option>
                            <option>Shortlet</option>
                            <option>Office</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>

                    {/* Price Range */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-2xl p-1 border border-transparent">
                        <input
                            type="text"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleInputChange}
                            placeholder="Min. Price"
                            className="w-28 pl-4 py-2.5 bg-transparent outline-none font-bold text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                        />
                        <div className="h-4 w-[1px] bg-neutral-200 dark:bg-white/10" />
                        <input
                            type="text"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleInputChange}
                            placeholder="Max. Price"
                            className="w-28 pl-4 py-2.5 bg-transparent outline-none font-bold text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                        />
                    </div>

                    {/* Bedrooms */}
                    <div className="relative group min-w-[120px]">
                        <select
                            name="bedrooms"
                            value={filters.bedrooms}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-10 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#BEF264] rounded-2xl outline-none font-bold text-sm transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="">Bedrooms</option>
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <option key={n} value={n.toString()}>{n} Bedrooms</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    </div>

                    {/* Zone Dropdown */}
                    <div className="relative group min-w-[140px]">
                        <select
                            name="zone"
                            value={filters.zone}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-10 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#BEF264] rounded-2xl outline-none font-bold text-sm transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option>All Zones</option>
                            <option>Under-G</option>
                            <option>Adenike</option>
                            <option>Aroje</option>
                            <option>Yoaco</option>
                            <option>General</option>
                            <option>Stadium</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>

                    {/* Amenity Dropdown */}
                    <div className="relative group min-w-[140px]">
                        <select
                            name="amenity"
                            value={filters.amenity}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-10 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#BEF264] rounded-2xl outline-none font-bold text-sm transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option>Any</option>
                            <option>Running Water</option>
                            <option>Prepaid Meter</option>
                            <option>Security</option>
                            <option>AC</option>
                            <option>Generator</option>
                            <option>Wardrobe</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>

                    {/* Search Button */}
                    <button type="submit" className="bg-black dark:bg-[#BEF264] text-white dark:text-black px-4 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-[#BEF264]/10">
                        Search
                    </button>
                    
                    {/* Reset Filters */}
                    {(filters.q || filters.category !== 'All Categories' || filters.minPrice || filters.maxPrice || filters.bedrooms || filters.zone !== 'All Zones' || filters.amenity !== 'Any') && (
                        <button 
                            type="button" 
                            onClick={() => {
                                const reset = { q: '', category: 'All Categories', minPrice: '', maxPrice: '', bedrooms: '', zone: 'All Zones', amenity: 'Any' };
                                setFilters(reset);
                                updateURL(reset);
                            }}
                            className="p-3 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
        </form>
            </div>
        </div>
    );
}
