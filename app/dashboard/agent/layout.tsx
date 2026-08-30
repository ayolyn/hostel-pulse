import { UnderReview } from '@/components/ui/UnderReview';
import CompliancePortal from '@/components/dashboard/CompliancePortal';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { GlobalSupportWidget } from '@/components/messages/GlobalSupportWidget';

export const dynamic = 'force-dynamic';

/**
 * Agent Dashboard Layout — wraps all /dashboard/agent/* pages
 * Uses AgentHeader (dark theme).
 */
export default async function AgentDashboardLayout({
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

    if (roleData?.role !== 'agent') {
        redirect('/dashboard');
    }

    const termsStatus = cookieStore.get(`terms_status_${user.id}`)?.value;
    if (!termsStatus) {
        redirect('/agent-terms');
    }

    const { data: account } = await supabase
        .from('agent_accounts')
        .select('is_approved, compliance_submitted')
        .eq('id', user.id)
        .single();

    const isApproved = account?.is_approved ?? false;
    const hasSubmittedCompliance = account?.compliance_submitted ?? false;

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {!hasSubmittedCompliance ? (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                    <CompliancePortal accountType="agent" userId={user.id} />
                </main>
            ) : !isApproved ? (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                    <UnderReview />
                </main>
            ) : (
                <>
                    {children}
                    <GlobalSupportWidget />
                </>
            )}
        </div>
    );
}
