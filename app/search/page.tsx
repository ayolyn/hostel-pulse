"use client";
export const runtime = 'edge';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PropertyCard from "@/components/ui/PropertyCard";
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PropertyFilterBar } from '@/components/property/PropertyFilterBar';
import Link from 'next/link';
import { Building2, Loader2, Home } from "lucide-react";

type Property = {
    id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
    verification_status: string;
    category: string;
    listing_type: string;
    bedrooms: number;
};

function SearchContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const bedrooms = searchParams.get('bedrooms') || '';

    useEffect(() => {
        async function load() {
            setLoading(true);
            let query = supabase
                .from('properties')
                .select('*')
                .eq('status', 'active');

            // Apply filters
            if (q) {
                const normalizedQ = q.trim().replace(/[\s-]+/g, '%');
                query = query.or(`title.ilike.%${normalizedQ}%,location.ilike.%${normalizedQ}%,description.ilike.%${normalizedQ}%`);
            }
            if (category && category !== 'All Categories') query = query.eq('category', category);
            if (minPrice) query = query.gte('price', Number(minPrice));
            if (maxPrice) query = query.lte('price', Number(maxPrice));
            if (bedrooms) query = query.eq('bedrooms', Number(bedrooms));

            const { data } = await query.order('created_at', { ascending: false });

            setProperties(data || []);
            setLoading(false);
        }
        load();
    }, [supabase, q, category, minPrice, maxPrice, bedrooms]);

    const getPriceLabel = (p: Property) => {
        if (p.listing_type === 'sale') return 'Sale Price';
        if (p.category === 'Hotel') return 'per night';
        return 'per year';
    };

    return (
        <>
            <div className="mb-12">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Search Results</h1>
                <p className="text-gray-400 dark:text-zinc-300 font-medium">
                    {loading ? 'Searching properties...' : `${properties.length} match${properties.length !== 1 ? 'es' : ''} found in Ogbomoso`}
                </p>
            </div>

            <PropertyFilterBar />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 text-[#BEF264] animate-spin" />
                    <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Filtering Database...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <Building2 className="w-16 h-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">No properties found</h3>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20 mt-12">
                    {properties.map(p => (
                        <Link key={p.id} href={`/property/${p.id}`} className="block group">
                            <PropertyCard
                                title={p.title}
                                location={p.location}
                                price={`₦${Number(p.price).toLocaleString()}`}
                                rating={4.8}
                                image={p.images?.[0] ?? 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600'}
                                verified={p.verification_status === 'Verified' || p.verification_status === 'Live View'}
                                priceLabel={getPriceLabel(p)}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

export default function SearchPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full">
                <Suspense fallback={<div>Loading...</div>}>
                    <SearchContent />
                </Suspense>
            </main>
        </div>
    );
}

