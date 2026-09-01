'use client';
export const runtime = 'edge';

import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { Map, Shield, Navigation } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const areas = [
    {
        name: 'Under-G',
        description: 'The bustling heart of student life. Closest to the main campus gate with vibrant markets and nightlife.',
        security: 'High',
        distance: '0-5 mins walk to campus',
        color: 'from-[#BEF264] to-emerald-400'
    },
    {
        name: 'Adenike',
        description: 'A popular residential zone offering a balance of peace and accessibility to academic areas.',
        security: 'Medium-High',
        distance: '5-10 mins walk to campus',
        color: 'from-blue-400 to-indigo-400'
    },
    {
        name: 'Aroje',
        description: 'Quieter environment perfect for serious study. Often features newer, premium hostel developments.',
        security: 'High',
        distance: '10-15 mins drive to campus',
        color: 'from-purple-400 to-fuchsia-400'
    },
    {
        name: 'General Area',
        description: 'More affordable housing options mixed with local residential communities.',
        security: 'Medium',
        distance: '15-20 mins drive to campus',
        color: 'from-rose-400 to-orange-400'
    }
];

export default function AreaGuidePage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-5xl mx-auto w-full pb-24">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-[#BEF264]/20 text-black dark:text-[#BEF264] rounded-2xl mb-6">
                        <Map className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-3xl sm:text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
                        Area Guides
                    </h1>
                    <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg">
                        Explore local student neighborhoods in Ogbomoso. Get descriptions, security ratings, and distance info to help you choose the perfect hostel location.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {areas.map((area, idx) => (
                        <motion.div 
                            key={area.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-gray-100 dark:border-white/5 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${area.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`} />
                            
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">
                                {area.name}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                                {area.description}
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Rating</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{area.security}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                        <Navigation className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distance to LAUTECH</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{area.distance}</p>
                                    </div>
                                </div>
                            </div>

                            <Link 
                                href={`/rent?q=${area.name}`}
                                className="mt-8 block w-full py-3 px-4 bg-gray-50 dark:bg-white/5 text-center rounded-xl font-black uppercase tracking-widest text-xs text-gray-900 dark:text-white hover:bg-[#BEF264] hover:text-black transition-colors"
                            >
                                View Hostels in {area.name}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>
            
        </div>
    );
}
