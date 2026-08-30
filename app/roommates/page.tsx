'use client';
export const runtime = 'edge';

import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';
import { RoommateDiscovery } from '@/components/roommates/RoommateDiscovery';
import { PostRoommateRequest } from '@/components/roommates/PostRoommateRequest';
import { Users, Plus, X } from 'lucide-react';
import { useState, Suspense, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RoommatesPage() {
    const [showForm, setShowForm] = useState(false);
    const [isLooking, setIsLooking] = useState(false);
    const supabase = createClient();

    const fetchStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('student_accounts').select('looking_for_roommate').eq('id', user.id).single();
            setIsLooking(!!data?.looking_for_roommate);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [supabase]);

    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Roommates...</div>}>
            <StudentDashboardShell>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-1">Community match</p>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Roommate Discovery
                    </h1>
                    <p className="text-gray-500 font-medium">Find compatible students to share rent and lifestyle with.</p>
                </div>

                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`
                        flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg
                        ${showForm 
                            ? 'bg-red-50 text-red-500 hover:bg-red-100 shadow-red-500/10' 
                            : 'bg-[#BEF264] text-black hover:bg-[#a6d456] shadow-[#BEF264]/20'
                        }
                    `}
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : (isLooking ? 'Manage Preferences' : 'Post Request')}
                </button>
            </div>
            
            {showForm ? (
                <div className="mb-12">
                    <PostRoommateRequest 
                        onClose={() => setShowForm(false)} 
                        onSuccess={() => {
                            setShowForm(false);
                            fetchStatus();
                        }}
                    />
                </div>
            ) : (
                <RoommateDiscovery />
            )}
        </StudentDashboardShell>
        </Suspense>
    );
}
