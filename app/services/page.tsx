'use client';
export const runtime = 'edge';

import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { CampusGigs } from '@/components/gigs/CampusGigs';
import { Suspense } from 'react';

export default function ServicesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full flex-grow pb-20">
                <Suspense fallback={<div className="p-5 text-center text-gray-500">Loading Campus Gigs...</div>}>
                    <div className="mb-8">
                        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Campus Gigs</h1>
                        <p className="text-gray-500 dark:text-gray-400">Earn money on campus or pay someone to run your errands.</p>
                    </div>
                    <CampusGigs />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
