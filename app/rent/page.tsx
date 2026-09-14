'use client';
export const runtime = 'edge';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PropertyCard from '@/components/ui/PropertyCard';
import { PropertyFilterBar } from '@/components/property/PropertyFilterBar';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { Home, Loader2, Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { trackSearchEvent } from '@/app/actions/analytics';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/map/PulseMapbox'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] rounded-3xl bg-gray-100 dark:bg-white/5 animate-pulse flex items-center justify-center border border-gray-200 dark:border-white/10">
            <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-[#BEF264] animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Map...</p>
            </div>
        </div>
    )
});

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
    latitude?: number;
    longitude?: number;
};

function RentContent() {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const q = searchParams.get('q') || '';
    const type = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sort = searchParams.get('sort') || 'recent';
    const zone = searchParams.get('zone') || '';
    const viewMode = searchParams.get('view') || 'list';

    const clearFilters = () => {
        router.push('/rent');
    };

    useEffect(() => {
        async function load() {
            setLoading(true);
            let query = supabase
                .from('properties')
                .select('*')
                .eq('listing_type', 'rent')
                .eq('is_active', true);
            
            if (q) {
                const normalizedQ = q.trim().replace(/[\s-]+/g, '%');
                query = query.or(`title.ilike.%${normalizedQ}%,location.ilike.%${normalizedQ}%`);
            }
            if (zone && zone !== 'All Zones') {
                query = query.ilike('zone', `%${zone}%`);
            }
            if (type && type !== 'All Categories') query = query.eq('category', type);
            if (minPrice) query = query.gte('price', minPrice);
            if (maxPrice) query = query.lte('price', maxPrice);

            if (sort === 'lowest_rent') {
                query = query.order('price', { ascending: true });
            } else if (sort === 'newest') {
                query = query.order('created_at', { ascending: false });
            } else {
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
    }, [supabase, q, type, minPrice, maxPrice, sort, zone]);

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
            
            <PropertyFilterBar mode="rent" />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 text-[#BEF264] animate-spin" />
                    <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Inventory...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                        <Home className="w-10 h-10 text-gray-300 dark:text-neutral-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No hostels available here yet.</h3>
                    <p className="text-gray-500 font-medium mt-2 mb-8 max-w-md">
                        We're actively adding new properties around Ogbomoso.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={clearFilters} className="bg-black dark:bg-[#BEF264] text-white dark:text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                            View All Hostels
                        </button>
                        <button onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('zone');
                            params.delete('q');
                            router.push(`/rent₦${params.toString()}`);
                        }} className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            Try Another Area
                        </button>
                    </div>
                </div>
            ) : viewMode === 'map' ? (
                <div className="mt-8 pb-20 max-w-[1400px] mx-auto">
                    <PropertyMap properties={properties as any} />
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
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black">
            <PublicHeader />
            <main className="pt-32 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-grow">
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                    <RentContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
