"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Users, Moon, Sparkles, BookOpen, Wallet, Loader2, MessageSquare, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function RoommatesTab({ userId, userProfile }: { userId: string; userProfile: any }) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);
    const [profiles, setProfiles] = useState<any[]>([]);

    // Form state
    const [budgetMax, setBudgetMax] = useState('');
    const [sleepSchedule, setSleepSchedule] = useState('Flexible');
    const [cleanliness, setCleanliness] = useState('Average');
    const [department, setDepartment] = useState(userProfile?.department || '');
    const [bio, setBio] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchRoommateData() {
            setLoading(true);
            try {
                // Check if current user has a profile
                const { data: myProfile, error: myError } = await supabase
                    .from('roommate_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (myProfile) {
                    setHasProfile(true);
                    
                    // Fetch other profiles
                    const { data: otherProfiles, error: othersError } = await supabase
                        .from('roommate_profiles')
                        .select('*')
                        .neq('user_id', userId);

                    if (othersError) throw othersError;

                    const safeProfiles = otherProfiles || [];
                    
                    // Manually fetch student account data to avoid FK ambiguity
                    if (safeProfiles.length > 0) {
                        const userIds = safeProfiles.map((p: any) => p.user_id);
                        const { data: students, error: studentsError } = await supabase
                            .from('student_accounts')
                            .select('id, full_name, avatar_url, level')
                            .in('id', userIds);
                            
                        if (studentsError) console.error("Error fetching student accounts:", studentsError);
                        
                        const enrichedProfiles = safeProfiles.map((p: any) => {
                            const student = (students || []).find((s: any) => s.id === p.user_id);
                            return {
                                ...p,
                                full_name: student?.full_name || 'Anonymous Student',
                                avatar_url: student?.avatar_url || null,
                                level: student?.level || ''
                            };
                        });
                        setProfiles(enrichedProfiles);
                    } else {
                        setProfiles([]);
                    }
                } else {
                    setHasProfile(false);
                }
            } catch (error: any) {
                if (error.code !== 'PGRST116') { // PGRST116 is "No rows found" for single()
                    console.error("Error fetching roommate data:", error);
                }
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            fetchRoommateData();
        }
    }, [userId, supabase]);

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const numBudget = Number(budgetMax);
            if (isNaN(numBudget) || numBudget <= 0) {
                toast.error("Please enter a valid budget.");
                return;
            }

            const { error } = await supabase.from('roommate_profiles').insert({
                user_id: userId,
                budget_max: numBudget,
                sleep_schedule: sleepSchedule,
                cleanliness: cleanliness,
                department: department,
                bio: bio
            });

            if (error) throw error;
            
            toast.success("Roommate profile created successfully!");
            setHasProfile(true);
            
            // Re-run the effect by refreshing the page
            window.location.reload();
        } catch (error: any) {
            console.error("Error creating profile:", error);
            toast.error("Failed to create profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendMessage = (targetUserId: string) => {
        router.push(`?tab=messages&newChat=${targetUserId}`);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 dark:bg-neutral-900 rounded-2xl border border-white/5" />)}
            </div>
        );
    }

    if (!hasProfile) {
        return (
            <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#BEF264]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-[#BEF264]" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Create Your Roommate Profile</h2>
                    <p className="text-gray-500 mt-2 text-sm">Tell us about your habits and budget to find the perfect roommate match.</p>
                </div>

                <form onSubmit={handleCreateProfile} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Maximum Budget (₦)
                            </label>
                            <input 
                                type="number" 
                                required
                                value={budgetMax}
                                onChange={e => setBudgetMax(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#BEF264] outline-none"
                                placeholder="e.g. 150000"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                                    <Moon className="w-4 h-4" /> Sleep Schedule
                                </label>
                                <select 
                                    value={sleepSchedule}
                                    onChange={e => setSleepSchedule(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#BEF264] outline-none"
                                >
                                    <option value="Early Bird">Early Bird</option>
                                    <option value="Night Owl">Night Owl</option>
                                    <option value="Flexible">Flexible</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Cleanliness
                                </label>
                                <select 
                                    value={cleanliness}
                                    onChange={e => setCleanliness(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#BEF264] outline-none"
                                >
                                    <option value="Very Clean">Very Clean</option>
                                    <option value="Average">Average</option>
                                    <option value="Messy">Messy</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Department
                            </label>
                            <input 
                                type="text" 
                                required
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#BEF264] outline-none"
                                placeholder="e.g. Computer Science"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                Short Bio
                            </label>
                            <textarea 
                                required
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#BEF264] outline-none resize-none"
                                placeholder="A little about yourself, hobbies, what you look for in a roommate..."
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#BEF264] text-black py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#a6d456] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#BEF264]/20"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Users className="w-5 h-5" /> Save Profile</>}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#BEF264]" />
                        Roommate Discovery
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Connect with potential roommates looking for shared spaces.</p>
                </div>
            </div>

            {profiles.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl p-8 text-center">
                    <Users className="w-12 h-12 text-gray-200 dark:text-neutral-800 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">No Profiles Found</h3>
                    <p className="text-gray-500 mt-2 text-sm">Be the first to create a profile, or check back later when more students join.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map((p) => (
                        <div key={p.user_id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 p-6 rounded-2xl flex flex-col hover:border-[#BEF264]/40 transition-all shadow-sm group relative overflow-hidden">
                            <div className="absolute -top-6 -right-10 w-32 h-32 bg-[#BEF264] rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" />
                            
                            <div className="flex items-start gap-4 mb-4 relative z-10">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-800 overflow-hidden shrink-0">
                                    {p.avatar_url ? (
                                        <Image src={p.avatar_url} alt={p.full_name} width={64} height={64} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Users className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-gray-900 dark:text-white tracking-tight truncate text-lg">{p.full_name}</h4>
                                    <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-1 mt-0.5">
                                        <BookOpen className="w-3 h-3 text-[#BEF264]" /> {p.department} {p.level ? `(${p.level}L)` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                                <div className="bg-gray-50 dark:bg-neutral-950/50 p-3 rounded-2xl flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1">
                                        <Wallet className="w-3 h-3" /> Budget
                                    </span>
                                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₦{Number(p.budget_max).toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-neutral-950/50 p-3 rounded-2xl flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1">
                                        <Moon className="w-3 h-3" /> Sleep
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{p.sleep_schedule}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-neutral-950/50 p-4 rounded-2xl mb-6 flex-1 relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Bio & Habits ({p.cleanliness})
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 italic">"{p.bio}"</p>
                            </div>

                            <button 
                                onClick={() => handleSendMessage(p.user_id)}
                                className="mt-auto w-full bg-black dark:bg-white/10 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-transparent dark:border-white/5 relative z-10"
                            >
                                <MessageSquare className="w-4 h-4" /> Send Message
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
