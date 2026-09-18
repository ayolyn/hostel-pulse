'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PropertyCard from '@/components/ui/PropertyCard';
import { PropertyFilterBar } from '@/components/property/PropertyFilterBar';
import { Building2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
    images: string[];
    verification_status: string;
    category: string;
    bedrooms: number;
    latitude?: number;
    longitude?: number;
};

export function BuyView({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const bedrooms = searchParams.get('bedrooms') || '';
    const zone = searchParams.get('zone') || '';
    const amenity = searchParams.get('amenity') || '';
    const view = searchParams.get('view') || 'list';

    useEffect(() => {
        async function load() {
            setLoading(true);
            let query = supabase
                .from('properties')
                .select('*')
                .eq('listing_type', 'buy')
                .eq('is_active', true);

            // Apply filters
            if (q) {
                const normalizedQ = q.trim().replace(/[\s-]+/g, '%');
                query = query.or(`title.ilike.%${normalizedQ}%,location.ilike.%${normalizedQ}%`);
            }
            if (category && category !== 'All Categories') query = query.eq('category', category);
            if (minPrice) query = query.gte('price', Number(minPrice));
            if (maxPrice) query = query.lte('price', Number(maxPrice));
            if (bedrooms) query = query.eq('bedrooms', Number(bedrooms));
            if (zone && zone !== 'All Zones') query = query.ilike('zone', `%${zone}%`);
            if (amenity && amenity !== 'Any') query = query.contains('features', [amenity]);

            const { data } = await query.order('created_at', { ascending: false });

            setProperties(data || []);
            setLoading(false);
        }
        load();
    }, [supabase, q, category, minPrice, maxPrice, bedrooms, zone, amenity]);

    return (
        <div className={isEmbedded ? "animate-in fade-in slide-in-from-bottom-4 duration-700" : ""}>
            {isEmbedded && (
                <div className="mb-4">
                    <button onClick={() => router.push('/dashboard/student')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest text-xs font-black">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            )}
            <div className="mb-12">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Properties for Sale</h1>
                <p className="text-gray-500 font-medium">
                    {loading ? 'Refreshing listings...' : `${properties.length} listing${properties.length !== 1 ? 's' : ''} available in Ogbomoso`}
                </p>
            </div>

            <PropertyFilterBar mode="buy" basePath={isEmbedded ? "/dashboard/student" : "/buy"} />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 text-[#BEF264] animate-spin" />
                    <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Updating Listings...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <Building2 className="w-16 h-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">No matching results</h3>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search area.</p>
                </div>
            ) : view === 'map' ? (
                <div className="mt-8 pb-20 max-w-[1400px] mx-auto">
                    <PropertyMap properties={properties as any} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20 mt-12">
                    {properties.map(p => (
                        <Link key={p.id} href={`/property/${p.id}`} className="block group">
                            <PropertyCard
                                id={p.id}
                                title={p.title}
                                location={p.location}
                                price={`₦${Number(p.price).toLocaleString()}`}
                                rating={4.8}
                                image={(p.images && p.images.length > 0 && p.images[0] !== 'null') ? p.images[0] : '/placeholder.jpg'}
                                verificationStatus={p.verification_status}
                                
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
