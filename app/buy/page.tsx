'use client';
export const runtime = 'edge';

import { Suspense } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { BuyView } from '@/components/buy/BuyView';

export default function BuyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full">
                <Suspense fallback={<div>Loading...</div>}>
                    <BuyView />
                </Suspense>
            </main>
            
        </div>
    );
}


