'use client';

import { Suspense } from 'react';
import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/components/providers/AuthProvider';
import { ExploreContent } from '@/components/explore/ExploreContent';

export default function ExplorePage() {
    const { role } = useAuth();
    const isStudent = role?.toLowerCase() === 'student';

    return (
        <Suspense fallback={<div className="p-5 text-center text-gray-500">Loading Explore...</div>}>
            {isStudent ? (
                <StudentDashboardShell>
                    <ExploreContent />
                </StudentDashboardShell>
            ) : (
                <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black">
                    <PublicHeader />
                    <main className="pt-28 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-grow">
                        <ExploreContent />
                    </main>
                    <Footer />
                </div>
            )}
        </Suspense>
    );
}
