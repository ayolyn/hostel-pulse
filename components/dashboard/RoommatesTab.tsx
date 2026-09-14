'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Users, Moon, Sparkles, BookOpen, MessageSquare, Wallet, Search, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import PulseMapbox from '@/components/map/PulseMapbox';

export function RoommatesTab({ userId, userProfile }: { userId: string; userProfile: any }) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    // Profiles state
    const [hasProfile, setHasProfile] = useState(false);
    const [myProfileData, setMyProfileData] = useState<any>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    
    // View state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
                // 1. Fetch all profiles
                const { data: allProfiles, error: allProfilesError } = await supabase
                    .from('roommate_profiles')
                    .select('*');

                if (allProfilesError) throw allProfilesError;

                const safeProfiles = allProfiles || [];
                
                // Find my profile
                const myProf = safeProfiles.find((p: any) => p.user_id === userId);
                if (myProf) {
                    setHasProfile(true);
                    setMyProfileData(myProf);
                    // Pre-fill form
                    setBudgetMax(myProf.budget_max?.toString() || '');
                    setSleepSchedule(myProf.sleep_schedule || 'Flexible');
                    setCleanliness(myProf.cleanliness || 'Average');
                    setDepartment(myProf.department || userProfile?.department || '');
                    setBio(myProf.bio || '');
                } else {
                    setHasProfile(false);
                }

                // Get other profiles
                const otherProfiles = safeProfiles.filter((p: any) => p.user_id !== userId);
                
                if (otherProfiles.length > 0) {
                    const userIds = otherProfiles.map((p: any) => p.user_id);
                    const { data: students, error: studentsError } = await supabase
                        .from('student_accounts')
                        .select('id, full_name, avatar_url, level')
                        .in('id', userIds);
                        
                    if (studentsError) console.error("Error fetching student accounts:", studentsError);
                    
                    const enrichedProfiles = otherProfiles.map((p: any) => {
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
            } catch (error: any) {
                console.error("Error fetching roommate data:", error);
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            fetchRoommateData();
        }
    }, [userId, supabase, userProfile]);

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const numBudget = Number(budgetMax);
            if (isNaN(numBudget) || numBudget <= 0) {
                toast.error("Please enter a valid budget.");
                return;
            }

            const { error } = await supabase.from('roommate_profiles').upsert({
                user_id: userId,
                budget_max: numBudget,
                sleep_schedule: sleepSchedule,
                cleanliness: cleanliness,
                department: department,
                bio: bio
            });

            if (error) throw error;
            
            toast.success("Roommate profile saved!");
            setHasProfile(true);
            setIsEditingProfile(false);
            
            window.location.reload();
        } catch (error: any) {
            console.error("Error saving profile:", error);
            toast.error("Failed to save profile.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendMessage = (targetUserId: string) => {
        router.push(`?tab=messages&newChat=${targetUserId}`);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 dark:bg-neutral-900 rounded-2xl border border-white/5" />)}
            </div>
        );
    }

    const filteredProfiles = profiles.filter(p => 
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#BEF264]" />
                        Roommate Discovery
                    </h2>
                    <p className="text-gray-500 text-[11px] mt-1">Connect with potential roommates looking for shared spaces.</p>
                </div>
            </div>

            {/* Profile Management Section */}
            {hasProfile && !isEditingProfile ? (
                <div className="bg-[#BEF264]/10 border border-[#BEF264]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#0D9488] mb-1">Your Active Profile</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">You are visible to other students in the roommate network.</p>
                    </div>
                    <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="shrink-0 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-md transition-all border border-gray-200 dark:border-white/10"
                    >
                        Edit My Profile
                    </button>
                </div>
            ) : !hasProfile && !isEditingProfile ? (
                <div className="bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-1">Join the Network</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Create a profile to let others know you are looking for a roommate.</p>
                    </div>
                    <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="shrink-0 bg-[#BEF264] text-black px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all"
                    >
                        Create Profile
                    </button>
                </div>
            ) : null}

            {/* Profile Form (if editing) */}
            {isEditingProfile && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 p-4 sm:p-8 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl relative">
                    <button 
                        onClick={() => setIsEditingProfile(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        Cancel
                    </button>
                    <div className="text-center mb-4">
                        <div className="w-10 h-10 bg-[#BEF264]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-[#BEF264]" />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{hasProfile ? 'Edit Profile' : 'Create Profile'}</h2>
                        <p className="text-gray-500 mt-2 text-sm">Tell us about your habits and budget to find the perfect match.</p>
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
                                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-[#BEF264] outline-none"
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
                                        className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-[#BEF264] outline-none"
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
                                        className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-[#BEF264] outline-none"
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
                                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-[#BEF264] outline-none"
                                    placeholder="e.g. Computer Science"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Short Bio / Preferences</label>
                                <textarea 
                                    required
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-[#BEF264] outline-none resize-none"
                                    placeholder="What are you looking for in a roommate?"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#BEF264] text-black py-2 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#a6d456] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#BEF264]/20 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>
            )}

            {!isEditingProfile && (
                <>
                    {/* The Map */}
                    <div className="mb-4">
                        <PulseMapbox snapMode={true} activeCategory="roommates" />
                    </div>

                    {/* Roommates List & Search */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Available Roommates</h3>
                            <div className="h-px w-12 bg-gray-200 dark:bg-white/10 hidden sm:block" />
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, dept..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#BEF264] transition-colors"
                            />
                        </div>
                    </div>

                    {filteredProfiles.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl p-4 text-center">
                            <Users className="w-12 h-12 text-gray-200 dark:text-neutral-800 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">No Profiles Found</h3>
                            <p className="text-gray-500 mt-2 text-sm">
                                {searchQuery ? "Try a different search term." : "Check back later when more students join."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProfiles.map((p) => (
                                <div key={p.user_id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex flex-col hover:border-[#BEF264]/40 transition-all shadow-sm group relative overflow-hidden">
                                    <div className="absolute -top-4 -right-10 w-20 h-20 bg-[#BEF264] rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" />
                                    
                                    <div className="flex items-start gap-4 mb-4 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-800 overflow-hidden shrink-0">
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
                                            <span className="text-sm font-black text-gray-900 dark:text-white truncate">{p.sleep_schedule}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-neutral-950/50 p-4 rounded-2xl mb-6 relative z-10 grow">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{p.bio}"</p>
                                    </div>

                                    <button 
                                        onClick={() => handleSendMessage(p.user_id)}
                                        className="mt-auto w-full bg-black dark:bg-white/10 text-white py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-transparent dark:border-white/5 relative z-10"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Send Message
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
