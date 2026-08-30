'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, User, MapPin, Loader2, DollarSign, Lock, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { toast } from 'react-hot-toast';
import { CAMPUS_ZONES } from '@/lib/constants';

export function RoommateDiscovery() {
    const [matches, setMatches] = useState<any[]>([]);
    const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [zoneFilter, setZoneFilter] = useState('');
    const [budgetFilter, setBudgetFilter] = useState('');

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchMatches() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if verified
            const { data: profile } = await supabase
                .from('profiles')
                .select('student_id_url')
                .eq('id', user.id)
                .single();
            
            setIsVerified(profile?.student_id_url !== null);

            const { data, error } = await supabase
                .from('student_accounts')
                .select('*')
                .eq('looking_for_roommate', true)
                .neq('id', user.id) // Don't show current user
                .limit(50);

            if (data) {
                setMatches(data);
                setFilteredMatches(data);
            }
            setLoading(false);
        }
        fetchMatches();
    }, [supabase]);

    useEffect(() => {
        let result = matches;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m => m.full_name?.toLowerCase().includes(q) || m.department?.toLowerCase().includes(q));
        }
        if (zoneFilter) {
            result = result.filter(m => m.preferred_zone === zoneFilter);
        }
        if (budgetFilter) {
            result = result.filter(m => {
                const b = Number(m.roommate_metadata?.budget || 0);
                if (budgetFilter === '0-50000') return b <= 50000;
                if (budgetFilter === '50000-100000') return b > 50000 && b <= 100000;
                if (budgetFilter === '100000+') return b > 100000;
                return true;
            });
        }
        setFilteredMatches(result);
    }, [searchQuery, zoneFilter, budgetFilter, matches]);

    const handleStartChat = async (receiverId: string, receiverName: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Find or create a room for this roommate request (Super Defensive)
        try {
            // 1. Search for existing room in BOTH tables (High-reliability search)
            const [roomRes, convRes] = await Promise.all([
                supabase.from('chat_rooms')
                    .select('*')
                    .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${receiverId}),and(participant_one_id.eq.${receiverId},participant_two_id.eq.${user.id})`)
                    .maybeSingle(),
                supabase.from('conversations')
                    .select('*')
                    .eq('context_type', 'roommate')
                    .or(`and(participant_a.eq.${user.id},participant_b.eq.${receiverId}),and(participant_a.eq.${receiverId},participant_b.eq.${user.id})`)
                    .maybeSingle()
            ]);

            const existingRoom = roomRes.data;
            const existingConv = convRes.data;

            let finalId = '';
            if (existingRoom) finalId = existingRoom.id;
            else if (existingConv) finalId = existingConv.id;

            if (finalId) {
                router.push(`/messages/${receiverId}?room_id=${finalId}`);
                return;
            }

            // 2. Create in chat_rooms first (Preferred)
            const { data: newRoom, error: roomErr } = await supabase
                .from('chat_rooms')
                .insert({
                    participant_one_id: user.id,
                    participant_two_id: receiverId,
                    category: 'COMMUNITY'
                })
                .select()
                .maybeSingle();

            if (newRoom) {
                finalId = newRoom.id;
            } else {
                // 3. Fallback to conversations if chat_rooms failed
                const { data: conv } = await supabase
                    .from('conversations')
                    .insert({
                        participant_a: user.id,
                        participant_b: receiverId,
                        context_type: 'roommate'
                    })
                    .select()
                    .maybeSingle();
                finalId = conv?.id || '';
            }

            if (finalId) {
                router.push(`/messages/${receiverId}?room_id=${finalId}`);
            } else {
                // Fallback to direct chat if no room ID can be obtained
                router.push(`/messages/${receiverId}`);
            }
        } catch (error: any) {
            console.error('Error initiating chat:', error);
            // Fallback to direct chat if room creation fails
            router.push(`/messages/${receiverId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#BEF264] animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Finding matches...</p>
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem] p-16 text-center">
                <User className="w-16 h-16 text-gray-200 dark:text-neutral-800 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">No Roommates Found</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                    Try checking back later or ensure you've enabled "Looking for Roommate" in your own profile.
                </p>
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-gray-50 dark:bg-neutral-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 text-center">
                <Lock size={48} className="text-gray-300 dark:text-gray-600 mb-6 mx-auto" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Roommates Locked</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-sm">Upload your Student ID in the Profile section to unlock.</p>
                <button 
                    onClick={() => router.push('/dashboard/student?tab=profile')}
                    className="bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:scale-105 transition-all shadow-xl"
                >
                    Go to Profile →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name or department..." 
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all text-sm font-medium"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 sm:w-auto w-full">
                    <select 
                        className="flex-1 sm:flex-none pl-4 pr-8 py-3 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all text-sm font-medium appearance-none cursor-pointer"
                        value={zoneFilter}
                        onChange={e => setZoneFilter(e.target.value)}
                    >
                        <option value="">All Zones</option>
                        {CAMPUS_ZONES.map(zone => (
                            <option key={zone} value={zone}>{zone}</option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                    <select 
                        className="flex-1 sm:flex-none pl-4 pr-8 py-3 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all text-sm font-medium appearance-none cursor-pointer"
                        value={budgetFilter}
                        onChange={e => setBudgetFilter(e.target.value)}
                    >
                        <option value="">Any Budget</option>
                        <option value="0-50000">Below ₦50k</option>
                        <option value="50000-100000">₦50k - ₦100k</option>
                        <option value="100000+">Above ₦100k</option>
                    </select>
                </div>
            </div>

            {filteredMatches.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem]">
                    <p className="text-gray-500 font-medium">No roommates match your current filters.</p>
                    <button 
                        onClick={() => {setSearchQuery(''); setZoneFilter(''); setBudgetFilter('');}} 
                        className="mt-4 text-black dark:text-[#BEF264] font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMatches.map((profile) => (
                        <div 
                            key={profile.id} 
                            className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-16 h-16 bg-[#BEF264]/10 dark:bg-[#BEF264]/5 rounded-2xl flex items-center justify-center text-[#BEF264] group-hover:scale-110 transition-transform overflow-hidden relative">
                                    {profile.avatar_url ? (
                                        <NextImage src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
                                    ) : (
                                        <User className="w-8 h-8" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight mb-1">{profile.full_name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {profile.department} • {profile.level}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 text-xs font-bold bg-gray-50 dark:bg-neutral-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                                    <MapPin className="w-3 h-3 text-[#BEF264]" />
                                    <span>{profile.preferred_zone || 'Anywhere'}</span>
                                </div>
                                {profile.roommate_metadata?.budget && (
                                    <div className="flex items-center gap-2 text-[#0D9488] text-xs font-black bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/10">
                                        <DollarSign className="w-3 h-3" />
                                        <span>₦{Number(profile.roommate_metadata.budget).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {profile.roommate_metadata?.habits && (
                                <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-2 mb-8 font-medium italic">
                                    "{profile.roommate_metadata.habits}"
                                </p>
                            )}

                            <button 
                                onClick={() => handleStartChat(profile.id, profile.full_name)}
                                className="mt-auto w-full bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-lg transition-all"
                            >
                                <MessageCircle size={18} />
                                Chat with {profile.full_name.split(' ')[0]}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
