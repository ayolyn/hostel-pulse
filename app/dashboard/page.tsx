export const runtime = 'edge';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function DashboardRoot() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {
                    // Not needed for read-only Server Component
                }
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/join');
    }

    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();

    if (roleData?.role === 'super_admin') {
        redirect('/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c');
    }

    if (roleData?.role) {
        const dashboardMap: Record<string, string> = {
            student: '/dashboard/student',
            non_student: '/dashboard/non-student',
            landlord: '/dashboard/landlord',
            agent: '/dashboard/agent'
        };
        // Redirect to role specific dashboard, fallback to student if role exists but is unknown
        redirect(dashboardMap[roleData.role] || '/dashboard/student');
    }

    // Default fallback: if no role exists, user needs to onboard
    redirect('/onboarding');
}
