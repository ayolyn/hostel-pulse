const fs = require('fs');

const content = `"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Moon, Sparkles, BookOpen, Wallet, MessageSquare, MapPin, Search, ChevronDown, Plus, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function RoommatesTab({ userId, userProfile }: { userId: string; userProfile: any }) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);
    const [myProfileData, setMyProfileData] = useState<any>(null);
    const [profiles, setProfiles] = useState<any[]>([]);

    // View state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [zoneFilter, setZoneFilter] = useState('All Zones');
    const [budgetFilter, setBudgetFilter] = useState('Any Budget');

    // Form state
    const [budgetMax, setBudgetMax] = useState('');
    const [sleepSchedule, setSleepSchedule] = useState('Flexible');
    const [cleanliness, setCleanliness] = useState('Average');
    const [department, setDepartment] = useState(userProfile?.department || '');
    const [preferredZone, setPreferredZone] = useState('General Area');
    const [bio, setBio] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchRoommateData() {
            setLoading(true);
            try {
                // Fetch all profiles
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
                    setBudgetMax(myProf.budget_max?.toString() || '');
                    setSleepSchedule(myProf.sleep_schedule || 'Flexible');
                    setCleanliness(myProf.cleanliness || 'Average');
                    setDepartment(myProf.department || userProfile?.department || '');
                    setPreferredZone(myProf.preferred_zone || 'General Area');
                    setBio(myProf.bio || '');
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
                preferred_zone: preferredZone,
                bio: bio
            });

            if (error) throw error;
            
            toast.success("Preferences saved successfully!");
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
        router.push(\`?tab=messages&newChat=\${targetUserId}\`);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 animate-pulse px-4 pb-24">
                <div className="h-12 bg-white/5 rounded-xl mb-4" />
                <div className="h-32 bg-white/5 rounded-[2rem]" />
                <div className="h-32 bg-white/5 rounded-[2rem]" />
            </div>
        );
    }

    const filteredProfiles = profiles.filter(p => {
        const matchesSearch = p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.department?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesZone = zoneFilter === 'All Zones' || p.preferred_zone === zoneFilter;
        return matchesSearch && matchesZone;
    });

    return (
        <div className="max-w-xl mx-auto px-4 pb-24 space-y-6">
            {/* Header Area */}
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEF264] mb-1">Community Match</h4>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-2">Roommate Discovery</h2>
                <p className="text-gray-500 text-sm">Find compatible students to share rent and lifestyle with.</p>
            </div>

            {/* Manage Preferences Button */}
            <button 
                onClick={() => setIsEditingProfile(true)}
                className="w-full sm:w-auto bg-[#BEF264] text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(190,242,100,0.15)]"
            >
                <Plus className="w-5 h-5" /> Manage Preferences
            </button>

            {/* Search and Filters */}
            <div className="space-y-3 pt-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1A1A1A] text-white border border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#BEF264]/50 transition-colors placeholder:text-gray-500"
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    <button className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-3.5 rounded-2xl text-sm font-medium whitespace-nowrap shrink-0">
                        {zoneFilter}
                    </button>
                    <button className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-3.5 rounded-2xl text-sm font-medium whitespace-nowrap shrink-0">
                        {budgetFilter}
                    </button>
                </div>
            </div>

            {/* Roommate Cards */}
            <div className="space-y-4 pt-2">
                {filteredProfiles.length === 0 ? (
                    <div className="bg-[#111111] rounded-[2rem] p-8 text-center text-gray-400">
                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p>No compatible roommates found.</p>
                    </div>
                ) : (
                    filteredProfiles.map((p) => (
                        <div key={p.user_id} className="bg-[#111111] rounded-[2rem] p-5 relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-16 h-16 rounded-2xl bg-neutral-800 overflow-hidden shrink-0">
                                    {p.avatar_url ? (
                                        <Image src={p.avatar_url} alt={p.full_name} width={64} height={64} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Users className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg tracking-tight">{p.full_name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                        {p.department || 'STUDENT'} {p.level ? \`• \${p.level}L\` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#BEF264]" />
                                    <span className="text-xs font-semibold text-gray-300">{p.preferred_zone || 'Any Zone'}</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                    <span className="text-[#BEF264] font-bold text-sm">$</span>
                                    <span className="text-xs font-bold text-[#BEF264]">₦{Number(p.budget_max).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Floating Action Button */}
                            <button 
                                onClick={() => handleSendMessage(p.user_id)}
                                className="absolute bottom-5 right-5 w-12 h-12 bg-[#BEF264] rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                            >
                                <MessageSquare className="w-5 h-5 text-black fill-black" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for Managing Preferences */}
            {isEditingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Manage Preferences</h3>
                            <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <form onSubmit={handleCreateProfile} className="space-y-5">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Maximum Budget (₦)</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={budgetMax}
                                        onChange={e => setBudgetMax(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                        placeholder="e.g. 150000"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Preferred Zone</label>
                                    <select 
                                        value={preferredZone}
                                        onChange={e => setPreferredZone(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    >
                                        <option value="General Area">General Area</option>
                                        <option value="Under-G">Under-G</option>
                                        <option value="Adenike">Adenike</option>
                                        <option value="Aroje">Aroje</option>
                                        <option value="Any Zone">Any Zone</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Sleep</label>
                                        <select 
                                            value={sleepSchedule}
                                            onChange={e => setSleepSchedule(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                        >
                                            <option value="Early Bird">Early Bird</option>
                                            <option value="Night Owl">Night Owl</option>
                                            <option value="Flexible">Flexible</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Cleanliness</label>
                                        <select 
                                            value={cleanliness}
                                            onChange={e => setCleanliness(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                        >
                                            <option value="Very Clean">Very Clean</option>
                                            <option value="Average">Average</option>
                                            <option value="Messy">Messy</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Short Bio</label>
                                    <textarea 
                                        required
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#BEF264] resize-none"
                                        placeholder="What are you looking for in a roommate?"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#BEF264] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 shadow-lg shadow-[#BEF264]/20"
                                >
                                    {submitting ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
`;
fs.writeFileSync('components/dashboard/RoommatesTab.tsx', content, 'utf8');
console.log("Rewrote RoommatesTab perfectly based on screenshot 1");
