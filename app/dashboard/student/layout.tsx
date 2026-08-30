import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';
import { UnderReview } from '@/components/ui/UnderReview';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Student Dashboard Layout — wraps all /dashboard/student/* pages
 */
export default async function StudentDashboardLayout({
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

    if (roleData?.role !== 'student') {
        redirect('/dashboard');
    }

    const { data: account } = await supabase
        .from('student_accounts')
        .select('is_approved')
        .eq('id', user.id)
        .single();

    const isApproved = account?.is_approved ?? false;

    return (
        <StudentDashboardShell>
            {isApproved ? children : <UnderReview />}
        </StudentDashboardShell>
    );
}
