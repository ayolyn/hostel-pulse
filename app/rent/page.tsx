'use client';
export const runtime = 'edge';

import { Suspense } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import { RentView } from '@/components/rent/RentView';

export default function RentPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black">
            <PublicHeader />
            <main className="pt-32 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-grow">
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                    <RentView />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
