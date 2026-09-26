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

    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
    const role = roleData?.role?.toLowerCase();

    // Prioritize standard user dashboards
    if (role === 'student') {
        redirect('/dashboard/student');
    }
    if (role === 'landlord') {
        redirect('/dashboard/landlord');
    }
    if (role === 'agent') {
        redirect('/dashboard/agent');
    }
    if (role === 'non_student') {
        redirect('/dashboard/non-student');
    }

    // Check account tables in case user_roles wasn't populated or differs
    const { data: studentAcc } = await supabase.from('student_accounts').select('id').eq('id', user.id).maybeSingle();
    if (studentAcc) {
        redirect('/dashboard/student');
    }

    const { data: agentAcc } = await supabase.from('agent_accounts').select('id').eq('id', user.id).maybeSingle();
    if (agentAcc) {
        redirect('/dashboard/agent');
    }

    const { data: landlordAcc } = await supabase.from('landlord_accounts').select('id').eq('id', user.id).maybeSingle();
    if (landlordAcc) {
        redirect('/dashboard/landlord');
    }

    // Default fallback: always route to standard user portal, never redirect /dashboard to secret admin HQ
    redirect('/dashboard/student');
}
