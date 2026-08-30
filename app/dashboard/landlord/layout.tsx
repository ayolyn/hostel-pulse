import { LandlordDashboardShell } from '@/components/layout/LandlordDashboardShell';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import CompliancePortal from '@/components/dashboard/CompliancePortal';
import { UnderReview } from '@/components/ui/UnderReview';

export const dynamic = 'force-dynamic';

/**
 * Landlord Dashboard Layout — wraps all /dashboard/landlord/* pages.
 * Displays a global compliance banner if the user is not approved.
 */
export default async function LandlordDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() { }
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/join');
    }

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (roleData?.role !== 'landlord') {
        redirect('/dashboard');
    }

    const termsStatus = cookieStore.get(`terms_status_${user.id}`)?.value;
    if (!termsStatus) {
        redirect('/agent-terms');
    }

    const { data: account } = await supabase
        .from('landlord_accounts')
        .select('is_approved, compliance_submitted')
        .eq('id', user.id)
        .single();

    const isApproved = account?.is_approved ?? false;
    const hasSubmitted = account?.compliance_submitted ?? false;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-neutral-950 flex flex-col">
            <LandlordDashboardShell isApproved={isApproved}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
                    {isApproved || hasSubmitted ? (
                        children
                    ) : (
                        <CompliancePortal accountType="landlord" userId={user.id} />
                    )}
                </div>
            </LandlordDashboardShell>
        </div>
    );
}
