'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Heart } from 'lucide-react';
import PropertyCard from '@/components/ui/PropertyCard';
import Link from 'next/link';

type SavedProperty = {
    id: string;
    property_id: string;
    properties: { id: string; title: string; location: string; price: number; images: string[] } | null | any;
};

export function SavedPropertiesTab() {
    const supabase = createClient();
    const { user } = useAuth();
    const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchSavedProperties = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('saved_properties')
                .select('id, property_id, properties(id, title, location, price, images)')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });
            
            if (data) {
                setSavedProperties(data as SavedProperty[]);
            }
            setLoading(false);
        };

        fetchSavedProperties();
    }, [user, supabase]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-6">
                <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Saved Hostels
                </h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-gray-100 dark:bg-neutral-900 animate-pulse aspect-square rounded-2xl" />
                    ))}
                </div>
            ) : savedProperties.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl p-8 text-center">
                    <Heart className="w-12 h-12 text-gray-200 dark:text-neutral-800 mx-auto mb-4" />
                    <p className="font-black text-gray-400 uppercase tracking-tight text-lg">No saved hostels yet</p>
                    <p className="text-gray-400 text-sm mt-2">Tap ❤️ on any hostel to save it here.</p>
                    <Link href="/rent" className="mt-6 inline-block bg-[#BEF264] text-black font-black uppercase tracking-widest text-[10px] px-4 py-3 rounded-xl hover:bg-[#a5d852] transition-colors">
                        Browse Hostels
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((item) => {
                        if (!item.properties) return null;
                        const p = item.properties;
                        return (
                            <Link key={item.id} href={`/property/${p.id}`} className="block group">
                                <PropertyCard
                                    id={p.id}
                                    title={p.title}
                                    location={p.location}
                                    price={`₦${Number(p.price).toLocaleString()}`}
                                    rating={4.8}
                                    image={p.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=200'}
                                />
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
