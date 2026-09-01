export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';
import { CampusMarket } from '@/components/market/CampusMarket';
import { Suspense } from 'react';

export default function MarketPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center text-gray-500">Loading Market...</div>}>
            <StudentDashboardShell>
                <CampusMarket />
            </StudentDashboardShell>
        </Suspense>
    );
}
