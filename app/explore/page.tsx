'use client';
export const runtime = 'edge';

import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';
import { Suspense, useState } from 'react';
import { Map, Home, ShoppingBag, Bus, Coffee, BookOpen, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PulseMapbox = dynamic(() => import('@/components/map/PulseMapbox'), {
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

const categories = [
    { id: 'all', label: 'All', icon: Map, query: '' },
    { id: 'hostels', label: 'Hostels', icon: Home, query: 'hostels+near+LAUTECH+Ogbomoso' },
    { id: 'markets', label: 'Markets', icon: ShoppingBag, query: 'markets+Ogbomoso+Nigeria' },
    { id: 'transport', label: 'Transport', icon: Bus, query: 'motor+park+Ogbomoso' },
    { id: 'cafes', label: 'Food & Cafes', icon: Coffee, query: 'restaurants+Ogbomoso+Nigeria' },
    { id: 'library', label: 'Library & Study', icon: BookOpen, query: 'libraries+LAUTECH+Ogbomoso' },
];

const nearbySpots = [
    { name: 'LAUTECH Main Gate', type: 'Landmark', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', lng: 4.2666, lat: 8.1333 },
    { name: 'Under-G Market', type: 'Market', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', lng: 4.2600, lat: 8.1400 },
    { name: 'Adenike Bus Stop', type: 'Transport', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', lng: 4.2690, lat: 8.1450 },
    { name: 'Takie Zone', type: 'Residential', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', lng: 4.2435, lat: 8.1338 },
    { name: 'General Area', type: 'Residential', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', lng: 4.2500, lat: 8.1400 },
];

function getWalkingTime(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; 
    
    // Average walking speed ~ 5 km/h -> ~ 83 m/min
    const walkMins = Math.round((distance * 1000) / 83);
    
    if (walkMins < 1) return '0 mins';
    if (walkMins > 60) return `${Math.round(distance / 30 * 60)} mins drive`; // Approximate drive time if too far
    return `${walkMins} mins walk`;
}

function ExploreContent() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-1">Map View</p>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Explore Ogbomoso
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 text-sm">
                        Discover hostels, markets, and key spots near LAUTECH campus.
                    </p>
                </div>
                <Link
                    href="/rent"
                    className="flex items-center gap-2 bg-[#BEF264] text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20"
                >
                    <Home className="w-4 h-4" />
                    Browse Listings
                </Link>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeCategory === cat.id
                                    ? 'bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/20 scale-105'
                                    : 'bg-white dark:bg-neutral-900 text-gray-500 border border-gray-100 dark:border-white/5 hover:border-[#BEF264]/30 hover:bg-[#BEF264]/5 hover:text-[#BEF264]'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Main Layout: Map + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl bg-gray-100 dark:bg-neutral-900" style={{ minHeight: 480 }}>
                    <PulseMapbox properties={[]} showLandmarks={true} snapMode={true} activeCategory={activeCategory} flyToLocation={flyToLocation} zoom={13} />
                </div>

                {/* Nearby Spots Sidebar */}
                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#BEF264]" />
                            Key Locations
                        </p>
                        <div className="space-y-3">
                            {nearbySpots.map((spot, i) => {
                                // Calculate distance from LAUTECH Main Gate as the anchor point
                                const distString = getWalkingTime(8.1333, 4.2666, spot.lat, spot.lng);
                                
                                return (
                                <div
                                    key={i}
                                    onClick={() => setFlyToLocation([spot.lng, spot.lat])}
                                    className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-[#BEF264] hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white text-sm group-hover:text-[#BEF264] transition-colors">{spot.name}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${spot.bg} ${spot.color} mt-1 inline-block`}>
                                            {spot.type}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">{distString}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-black dark:bg-[#BEF264]/10 rounded-2xl p-5 border border-white/5 dark:border-[#BEF264]/20 mt-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-4">Quick Actions</p>
                        <div className="space-y-3">
                            <Link href="/rent" className="flex items-center justify-between text-white dark:text-[#BEF264] text-xs font-black uppercase tracking-wider hover:opacity-80 transition-all">
                                Browse Hostels <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <Link href="/agents" className="flex items-center justify-between text-white dark:text-[#BEF264] text-xs font-black uppercase tracking-wider hover:opacity-80 transition-all">
                                Find an Agent <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <Link href="/area-guide" className="flex items-center justify-between text-white dark:text-[#BEF264] text-xs font-black uppercase tracking-wider hover:opacity-80 transition-all">
                                Area Guides <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="p-5 text-center text-gray-500">Loading Explore...</div>}>
            <StudentDashboardShell>
                <ExploreContent />
            </StudentDashboardShell>
        </Suspense>
    );
}
