'use client';
export const runtime = 'edge';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PropertyCard from '@/components/ui/PropertyCard';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { Home, Loader2, Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { trackSearchEvent } from '@/app/actions/analytics';

type Property = {
    id: string;
    title: string;
    location: string;
    price: number;
    total_move_in_cost: number;
    images: string[];
    verification_status: string;
    category: string;
    bedrooms: number;
    video_url?: string;
    verified_walkthrough?: boolean;
    status: string;
};

function RentContent() {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sort = searchParams.get('sort') || 'recent';

    const createQueryString = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            });
            return params.toString();
        },
        [searchParams]
    );

    const handleFilterChange = (updates: Record<string, string>) => {
        router.push(pathname + '?' + createQueryString(updates));
    };

    const clearFilters = () => {
        router.push(pathname);
    };

    useEffect(() => {
        async function load() {
            setLoading(true);
            let query = supabase
                .from('properties')
                .select('*')
                .eq('listing_type', 'rent')
                .eq('is_active', true)
                .eq('status', 'active');

            // Text Search
            if (q) {
                const normalizedQ = q.trim().replace(/[\s-]+/g, '%');
                query = query.or(`title.ilike.%${normalizedQ}%,location.ilike.%${normalizedQ}%,description.ilike.%${normalizedQ}%`);
            }
            
            // Category/Type
            if (type && type !== 'All Categories') query = query.eq('category', type);
            
            // Budget (Total Move In Cost preferred if it exists, but for querying we use price or total_move_in_cost)
            // For simplicity in launch: we query `price` for the budget slider
            if (minPrice) query = query.gte('price', Number(minPrice));
            if (maxPrice) query = query.lte('price', Number(maxPrice));
            
            // Sorting
            if (sort === 'recent') {
                query = query.order('verified_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
            } else if (sort === 'lowest_rent') {
                query = query.order('price', { ascending: true });
            } else if (sort === 'newest') {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query.limit(40);

            if (data) {
                setProperties(data);
                if (data.length === 0) {
                    trackSearchEvent({
                        query: q,
                        propertyType: type,
                        minBudget: minPrice ? Number(minPrice) : undefined,
                        maxBudget: maxPrice ? Number(maxPrice) : undefined,
                        resultsCount: 0
                    });
                }
            }
            setLoading(false);
        }
        load();
    }, [supabase, q, type, minPrice, maxPrice, sort]);

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-3">
                    {q ? `Search: ${q}` : 'Find a Hostel'}
                </h1>
                <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">
                    {loading ? 'Searching...' : `${properties.length} available in Ogbomoso`}
                </p>
            </div>
            
            {/* Simple Inline Filters */}
            <div className="bg-white p-3 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 mb-8 sticky top-24 z-30">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Area (e.g. Under-G)..."
                        value={q}
                        onChange={(e) => handleFilterChange({ q: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-gray-100 transition-colors"
                    />
                </div>
                
                <div className="flex gap-3">
                    {/* Category */}
                    <select 
                        value={type}
                        onChange={(e) => handleFilterChange({ type: e.target.value })}
                        className="w-full md:w-auto px-4 py-4 bg-gray-50 border-r-8 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-gray-100 cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="Self-Con">Self-Con</option>
                        <option value="Single Room">Single Room</option>
                        <option value="Room & Parlour">Room & Parlour</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Apartment">Apartment</option>
                    </select>

                    {/* Price Range */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-2">
                        <input
                            type="number"
                            placeholder="Min ₦"
                            value={minPrice}
                            onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
                            className="w-20 sm:w-24 px-2 py-4 bg-transparent outline-none font-bold text-sm text-center"
                        />
                        <span className="text-gray-300">-</span>
                        <input
                            type="number"
                            placeholder="Max ₦"
                            value={maxPrice}
                            onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
                            className="w-20 sm:w-24 px-2 py-4 bg-transparent outline-none font-bold text-sm text-center"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <select 
                        value={sort}
                        onChange={(e) => handleFilterChange({ sort: e.target.value })}
                        className="w-full md:w-auto px-4 py-4 bg-gray-50 border-r-8 border-transparent rounded-2xl outline-none font-bold text-sm focus:bg-gray-100 cursor-pointer"
                    >
                        <option value="recent">Recently Verified</option>
                        <option value="newest">Newest First</option>
                        <option value="lowest_rent">Lowest Rent</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 text-[#BEF264] animate-spin" />
                    <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Inventory...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Home className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No hostels available here yet.</h3>
                    <p className="text-gray-500 font-medium mt-2 mb-8 max-w-md">
                        We're actively adding new properties around Ogbomoso.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={clearFilters} className="bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                            View All Hostels
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20 mt-6">
                    {properties.map(p => {
                        const hasWalkthrough = Boolean(p.video_url && p.video_url !== 'null' && p.video_url !== 'undefined' && p.video_url.length > 5);
                        
                        return (
                            <Link key={p.id} href={`/property/${p.id}`} className="block group">
                                <PropertyCard
                                    id={p.id}
                                    title={p.title}
                                    location={p.location}
                                    category={p.category}
                                    price={`₦${Number(p.price).toLocaleString()}`}
                                    totalMoveInCost={p.total_move_in_cost ? `₦${Number(p.total_move_in_cost).toLocaleString()}` : undefined}
                                    verificationStatus={p.verification_status}
                                    hasWalkthrough={hasWalkthrough}
                                    isAvailable={p.status === 'active'}
                                    image={(p.images && p.images.length > 0 && p.images[0] !== 'null') ? p.images[0] : '/placeholder.jpg'}
                                />
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
}

export default function RentPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full flex-grow">
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                    <RentContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}