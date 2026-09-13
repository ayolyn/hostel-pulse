'use client';
export const runtime = 'edge';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PropertyCard from '@/components/ui/PropertyCard';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { Home, Loader2, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
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
    water_source: string;
    electricity_type: string;
    features: string[];
};

function RentContent() {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || searchParams.get('category') || '';
    const area = searchParams.get('area') || '';
    const minBudget = searchParams.get('minBudget') || '';
    const maxBudget = searchParams.get('maxBudget') || '';
    const budgetType = searchParams.get('budgetType') || 'total'; // 'total' or 'rent'
    const bedrooms = searchParams.get('bedrooms') || '';
    const verification = searchParams.get('verification') || '';
    const walkthrough = searchParams.get('walkthrough') || '';
    const sort = searchParams.get('sort') || 'recent';

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleFilterChange = (name: string, value: string) => {
        router.push(pathname + '?' + createQueryString(name, value));
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

            // 1. Text Search
            if (q) {
                const normalizedQ = q.trim().replace(/[\s-]+/g, '%');
                query = query.or(`title.ilike.%${normalizedQ}%,location.ilike.%${normalizedQ}%,description.ilike.%${normalizedQ}%`);
            }
            
            // 2. Area
            if (area) query = query.ilike('location', `%${area}%`);
            
            // 3. Category/Type
            if (type) query = query.eq('category', type);
            
            // 4. Budget
            const priceField = budgetType === 'rent' ? 'price' : 'total_move_in_cost';
            if (minBudget) query = query.gte(priceField, Number(minBudget));
            if (maxBudget) query = query.lte(priceField, Number(maxBudget));
            
            // 5. Bedrooms
            if (bedrooms) {
                if (bedrooms.includes('+')) {
                    query = query.gte('bedrooms', Number(bedrooms.replace('+', '')));
                } else {
                    query = query.eq('bedrooms', Number(bedrooms));
                }
            }

            // 6. Verification
            if (verification === 'Physically Inspected') {
                query = query.eq('verification_status', 'Physically Inspected');
            } else if (verification === 'Details Checked') {
                query = query.in('verification_status', ['Physically Inspected', 'Details Checked']);
            }

            // Amenity
            const amenity = searchParams.get('amenity');
            if (amenity) query = query.contains('features', [amenity]);

            // Water & Electricity
            const water = searchParams.get('water');
            const electricity = searchParams.get('electricity');
            if (water) query = query.eq('water_source', water);
            if (electricity) query = query.eq('electricity_type', electricity);

            // 7. Walkthrough
            if (walkthrough === 'yes') {
                query = query.not('video_url', 'is', null).neq('video_url', '').neq('video_url', 'null');
            } else if (walkthrough === 'verified') {
                query = query.not('video_url', 'is', null).neq('video_url', '').neq('video_url', 'null').eq('verified_walkthrough', true);
            }

            // Sorting
            if (sort === 'recent') {
                query = query.order('verified_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
            } else if (sort === 'lowest_total') {
                query = query.order('total_move_in_cost', { ascending: true });
            } else if (sort === 'highest_total') {
                query = query.order('total_move_in_cost', { ascending: false });
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
                        area: area,
                        propertyType: type,
                        minBudget: minBudget ? Number(minBudget) : undefined,
                        maxBudget: maxBudget ? Number(maxBudget) : undefined,
                        budgetType: budgetType,
                        resultsCount: 0
                    });
                }
            }
            setLoading(false);
        }
        load();
    }, [supabase, q, type, area, minBudget, maxBudget, budgetType, bedrooms, verification, walkthrough, sort]);

    return (
        <>
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
                        {area ? `${area} Rooms` : 'Ogbomoso Housing'}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {loading ? 'Searching real database...' : `${properties.length} verified listing${properties.length !== 1 ? 's' : ''} available`}
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowFilters(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                    <div className="relative">
                        <select 
                            value={sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="h-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-sm appearance-none outline-none focus:border-black"
                        >
                            <option value="recent">Recently Verified</option>
                            <option value="newest">Newest Listings</option>
                            <option value="lowest_total">Lowest Total Cost</option>
                            <option value="lowest_rent">Lowest Rent</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Filter Drawer / Overlay */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
                    <div className="relative w-full max-w-md bg-white h-full overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-gray-100 flex items-center justify-between z-10">
                            <h2 className="font-black uppercase tracking-tight text-xl">Filters</h2>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-8 flex-1">
                            {/* Area */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Area</label>
                                <select 
                                    value={area}
                                    onChange={(e) => handleFilterChange('area', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-black rounded-2xl font-bold text-sm outline-none"
                                >
                                    <option value="">All Areas</option>
                                    <option value="Under-G">Under-G</option>
                                    <option value="Stadium">Stadium</option>
                                    <option value="Adenike">Adenike</option>
                                    <option value="Aroje">Aroje</option>
                                    <option value="Yoaco">Yoaco</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            {/* Property Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Property Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Self-Con', 'Single Room', 'Room & Parlour', 'Apartment', 'Hostel', 'Shop'].map(pt => (
                                        <button 
                                            key={pt}
                                            onClick={() => handleFilterChange('type', type === pt ? '' : pt)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${type === pt ? 'bg-black text-[#BEF264] border-black' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                        >
                                            {pt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bedrooms */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Bedrooms</label>
                                <div className="flex flex-wrap gap-2">
                                    {['1', '1+', '2', '2+', '3', '3+'].map(bd => (
                                        <button 
                                            key={bd}
                                            onClick={() => handleFilterChange('bedrooms', bedrooms === bd ? '' : bd)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${bedrooms === bd ? 'bg-black text-[#BEF264] border-black' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                        >
                                            {bd}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Budget</label>
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        <button 
                                            onClick={() => handleFilterChange('budgetType', 'total')}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${budgetType === 'total' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                                        >
                                            Total Move-In
                                        </button>
                                        <button 
                                            onClick={() => handleFilterChange('budgetType', 'rent')}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${budgetType === 'rent' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                                        >
                                            Annual Rent
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number"
                                        placeholder="Min ₦"
                                        value={minBudget}
                                        onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-transparent focus:border-black rounded-2xl font-bold text-sm outline-none"
                                    />
                                    <div className="w-4 h-[2px] bg-gray-200 shrink-0" />
                                    <input 
                                        type="number"
                                        placeholder="Max ₦"
                                        value={maxBudget}
                                        onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-transparent focus:border-black rounded-2xl font-bold text-sm outline-none"
                                    />
                                </div>
                            </div>

                            {/* Verification */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Verification Level</label>
                                <select 
                                    value={verification}
                                    onChange={(e) => handleFilterChange('verification', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-black rounded-2xl font-bold text-sm outline-none"
                                >
                                    <option value="">All Live Listings</option>
                                    <option value="Details Checked">Details Checked or Higher</option>
                                    <option value="Physically Inspected">Physically Inspected Only</option>
                                </select>
                            </div>

                            {/* Amenities */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Amenities</label>
                                <select 
                                    value={searchParams.get('amenity') || ''}
                                    onChange={(e) => handleFilterChange('amenity', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-black rounded-2xl font-bold text-sm outline-none"
                                >
                                    <option value="">Any Amenity</option>
                                    <option value="Running water">Running water</option>
                                    <option value="Kitchen">Kitchen</option>
                                    <option value="Wardrobe">Wardrobe</option>
                                    <option value="Parking">Parking</option>
                                    <option value="Security">Security</option>
                                    <option value="Fenced compound">Fenced compound</option>
                                </select>
                            </div>

                            {/* Water Source */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Water Source</label>
                                <select 
                                    value={searchParams.get('water') || ''}
                                    onChange={(e) => handleFilterChange('water', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-black rounded-2xl font-bold text-sm outline-none"
                                >
                                    <option value="">Any Water Source</option>
                                    <option value="Borehole">Borehole</option>
                                    <option value="Well">Well</option>
                                    <option value="Public supply">Public supply</option>
                                </select>
                            </div>

                            {/* Electricity */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Electricity</label>
                                <select 
                                    value={searchParams.get('electricity') || ''}
                                    onChange={(e) => handleFilterChange('electricity', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-black rounded-2xl font-bold text-sm outline-none"
                                >
                                    <option value="">Any Electricity Type</option>
                                    <option value="Prepaid meter">Prepaid meter</option>
                                    <option value="Shared meter">Shared meter</option>
                                    <option value="Generator">Generator</option>
                                    <option value="Solar">Solar</option>
                                    <option value="Mixed">Mixed</option>
                                </select>
                            </div>

                            {/* Walkthrough */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Raw Walkthrough</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleFilterChange('walkthrough', walkthrough === 'yes' ? '' : 'yes')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${walkthrough === 'yes' ? 'bg-black text-[#BEF264] border-black' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        Available
                                    </button>
                                    <button 
                                        onClick={() => handleFilterChange('walkthrough', walkthrough === 'verified' ? '' : 'verified')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-1 ${walkthrough === 'verified' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white border-gray-200 text-emerald-600 hover:bg-emerald-50'}`}
                                    >
                                        Verified
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 flex gap-3">
                            <button 
                                onClick={clearFilters}
                                className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-gray-200 hover:bg-gray-50"
                            >
                                Reset
                            </button>
                            <button 
                                onClick={() => setShowFilters(false)}
                                className="flex-1 bg-black text-[#BEF264] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-900 shadow-xl"
                            >
                                Show {properties.length} Results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 text-[#BEF264] animate-spin" />
                    <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Filtering Database...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Home className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No rooms match these filters right now</h3>
                    <p className="text-gray-500 font-medium mt-2 mb-8 max-w-md">
                        We've recorded your search. We're constantly verifying new properties in Ogbomoso.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={clearFilters} className="bg-gray-100 text-gray-900 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200">
                            Clear all filters
                        </button>
                        <Link href="/rent?area=Under-G" className="bg-black text-[#BEF264] px-6 py-3 rounded-2xl font-bold hover:bg-neutral-900">
                            View Under-G
                        </Link>
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
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full">
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                    <RentContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}