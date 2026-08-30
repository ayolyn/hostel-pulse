'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';
import { LandlordDashboardShell } from '@/components/layout/LandlordDashboardShell';
import { AgentHeader } from '@/components/layout/AgentHeader';
import { Loader2 } from 'lucide-react';

export function MessagingLayout({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function getRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();
            
            setRole(data?.role || 'student');
            setLoading(false);
        }
        getRole();
    }, [supabase]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="w-10 h-10 text-[#BEF264] animate-spin" />
            </div>
        );
    }

    if (role === 'landlord') {
        return <LandlordDashboardShell isApproved={true}>{children}</LandlordDashboardShell>;
    }

    if (role === 'agent') {
        return (
            <div className="min-h-screen bg-neutral-950">
                <AgentHeader />
                <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 py-10">
                    {children}
                </main>
            </div>
        );
    }

    // Default to student layout
    return <StudentDashboardShell>{children}</StudentDashboardShell>;
}
