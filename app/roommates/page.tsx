'use client';
export const runtime = 'edge';

import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { RoommatesView } from '@/components/roommates/RoommatesView';
import { Suspense } from 'react';

export default function RoommatesPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center text-gray-500">Loading Roommates...</div>}>
            <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full flex-grow pb-20">
                <RoommatesView />
            </main>
            <Footer />
        </div>
        </Suspense>
    );
}
