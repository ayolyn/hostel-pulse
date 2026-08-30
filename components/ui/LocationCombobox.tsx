"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapPin, ChevronDown, Search, Plus } from 'lucide-react';

interface LocationComboboxProps {
    value: string;
    onChange: (location: string) => void;
    placeholder?: string;
}

export function LocationCombobox({ value, onChange, placeholder = 'Select a location...' }: LocationComboboxProps) {
    const supabase = createClient();
    const [locations, setLocations] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customLocation, setCustomLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchLocations() {
            const { data } = await supabase
                .from('locations')
                .select('name')
                .order('name', { ascending: true });
            setLocations(data?.map((l: any) => l.name) ?? []);
            setLoading(false);
        }
        fetchLocations();
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const filtered = query.length === 0
        ? locations
        : locations.filter(loc =>
            loc.toLowerCase().includes(query.toLowerCase())
        );

    const handleSelect = (loc: string) => {
        if (loc === '__other__') {
            setShowCustomInput(true);
            setIsOpen(false);
            setQuery('');
        } else {
            onChange(loc);
            setShowCustomInput(false);
            setIsOpen(false);
            setQuery('');
        }
    };

    const handleCustomSubmit = () => {
        if (customLocation.trim()) {
            onChange(customLocation.trim());
            setShowCustomInput(false);
        }
    };

    const displayValue = value || placeholder;
    const isPlaceholder = !value;

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`w-full p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 transition-all outline-none font-black text-left flex items-center justify-between gap-3
                    ${isOpen ? 'border-[#BEF264]' : 'border-transparent hover:border-gray-200 dark:hover:border-white/10'}
                    ${isPlaceholder ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-900 dark:text-white'}
                `}
            >
                <span className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400 dark:text-neutral-500" />
                    {displayValue}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Search input */}
                    <div className="p-3 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 rounded-xl px-3 py-2">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Type to search areas..."
                                className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <ul className="max-h-60 overflow-y-auto py-2">
                        {loading ? (
                            <li className="px-4 py-3 text-center text-sm text-gray-400 font-bold animate-pulse">
                                Loading areas...
                            </li>
                        ) : filtered.length === 0 ? (
                            <li className="px-4 py-3 text-center text-sm text-gray-400 font-bold">
                                No areas found for "{query}"
                            </li>
                        ) : (
                            filtered.map(loc => (
                                <li key={loc}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(loc)}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2
                                            ${value === loc
                                                ? 'bg-[#BEF264]/10 text-black dark:text-white'
                                                : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        {value === loc && <span className="text-[#BEF264]">✓</span>}
                                        {loc}
                                    </button>
                                </li>
                            ))
                        )}

                        {/* Other option */}
                        <li className="border-t border-gray-100 dark:border-white/5 mt-1 pt-1">
                            <button
                                type="button"
                                onClick={() => handleSelect('__other__')}
                                className="w-full text-left px-4 py-2.5 text-sm font-black text-[#BEF264] dark:text-[#BEF264] hover:bg-[#BEF264]/10 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Other — type a custom area
                            </button>
                        </li>
                    </ul>
                </div>
            )}

            {/* Custom input (shown when 'Other' selected) */}
            {showCustomInput && (
                <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                        type="text"
                        value={customLocation}
                        onChange={e => setCustomLocation(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
                        placeholder="Type your area name..."
                        autoFocus
                        className="flex-1 p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-[#BEF264] outline-none font-black text-gray-900 dark:text-white"
                    />
                    <button
                        type="button"
                        onClick={handleCustomSubmit}
                        className="px-5 py-2 bg-[#BEF264] text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#a6d456] transition-all"
                    >
                        Set
                    </button>
                </div>
            )}
        </div>
    );
}
