'use client';
export const runtime = 'edge';

import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';
import { CampusGigs } from '@/components/gigs/CampusGigs';
import { Suspense } from 'react';

export default function ServicesPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center text-gray-500">Loading Campus Gigs...</div>}>
            <StudentDashboardShell>
                <div className="mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Campus Gigs</h1>
                    <p className="text-gray-500 dark:text-gray-400">Earn money on campus or pay someone to run your errands.</p>
                </div>
                <CampusGigs />
            </StudentDashboardShell>
        </Suspense>
    );
}
