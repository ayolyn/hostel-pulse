import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({
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

    if (roleData?.role !== 'super_admin') {
        redirect('/dashboard'); // Kick unauthorized users out
    }

    return (
        <div className="flex min-h-screen bg-[#0F172A]">
            {/* Client-driven sidebar — wrapped in Suspense for useSearchParams compliance */}
            <Suspense fallback={
                <aside className="w-64 bg-gray-900 border-r border-white/5 h-screen" />
            }>
                <AdminSidebar />
            </Suspense>
            <div className="flex-1 w-full overflow-y-auto bg-[#0F172A]">
                {children}
            </div>
        </div>
    );
}
