"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
    Trophy, 
    Medal, 
    Star, 
    Zap, 
    TrendingUp, 
    MapPin, 
    ShieldCheck, 
    ChevronRight,
    Award,
    Filter,
    Loader2
} from 'lucide-react';
import { CAMPUS_ZONES } from '@/lib/constants';

interface LeaderboardAgent {
    agent_id: string;
    full_name: string;
    avatar_url: string;
    rank_tier: string;
    deals_closed: number;
    avg_rating: number;
    weighted_score: number;
    success_rate: number;
    agent_zone: string;
}

const ZONES = ['All', ...CAMPUS_ZONES];

export default function LeaderboardTab({ userId }: { userId: string }) {
    const supabase = createClient();
    const [agents, setAgents] = useState<LeaderboardAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterZone, setFilterZone] = useState('All');

    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const { data, error } = await supabase.rpc('get_agent_leaderboard', {
                    filter_zone: filterZone === 'All' ? null : filterZone
                });

                if (error) throw error;
                setAgents(data || []);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, [filterZone, supabase]);

    const myRank = agents.findIndex(a => a.agent_id === userId) + 1;
    const myData = agents.find(a => a.agent_id === userId);
    
    const top3 = agents.slice(0, 3);
    const others = agents.slice(3, 10);

    const getBadgeColor = (tier: string) => {
        if (tier === 'Gold') return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
        if (tier === 'Silver') return 'text-gray-300 border-gray-400/20 bg-gray-400/10';
        return 'text-orange-400 border-orange-400/20 bg-orange-400/10';
    };

    if (loading && agents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
                <div className="w-24 h-24 border-4 border-[#BEF264]/20 border-t-[#BEF264] rounded-full animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Analyzing Market Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-40">
            {/* Zone Filter */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                <Filter className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                {ZONES.map(zone => (
                    <button 
                        key={zone}
                        onClick={() => setFilterZone(zone)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0
                            ${filterZone === zone ? 'bg-[#BEF264] text-black shadow-xl shadow-[#BEF264]/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'}
                        `}
                    >
                        {zone}
                    </button>
                ))}
            </div>

            {/* Podium (Top 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-10">
                {/* 2nd Place */}
                {top3[1] && (
                    <div className="order-2 md:order-1 bg-white/5 border border-white/5 p-8 rounded-[3rem] text-center relative group hover:bg-white/10 transition-all scale-95">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gray-400/20 rounded-[2rem] flex items-center justify-center border border-gray-400/30 shadow-2xl">
                            <Medal className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="mt-8 mb-6 relative inline-block">
                             <div className="w-24 h-24 rounded-[2.5rem] bg-neutral-800 border-2 border-gray-400 overflow-hidden shadow-2xl">
                                <img src={top3[1].avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100'} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-neutral-900 border border-gray-400 text-gray-400 font-black rounded-xl flex items-center justify-center shadow-xl">#2</div>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate">{top3[1].full_name}</h3>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 mb-4 px-3 py-1 rounded-full border inline-block ${getBadgeColor(top3[1].rank_tier)}`}>{top3[1].rank_tier} Agent</p>
                        <div className="flex items-center justify-center gap-4 text-[#BEF264] font-black text-xs uppercase tracking-widest">
                            <TrendingUp className="w-4 h-4" />
                            {top3[1].deals_closed} Rentals
                        </div>
                    </div>
                )}

                {/* 1st Place - The King */}
                {top3[0] && (
                    <div className="order-1 md:order-2 bg-neutral-950 border-2 border-[#BEF264]/50 p-10 rounded-[3.5rem] text-center relative shadow-[0_0_50px_rgba(190,242,100,0.1)] group hover:scale-[1.02] transition-all">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#BEF264] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#BEF264]/30">
                            <Trophy className="w-12 h-12 text-black" />
                        </div>
                        <div className="mt-10 mb-8 relative inline-block">
                             <div className="w-32 h-32 rounded-[3.5rem] bg-neutral-800 border-4 border-[#BEF264] overflow-hidden shadow-2xl">
                                <img src={top3[0].avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100'} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-[#BEF264] text-black font-black text-2xl rounded-2xl flex items-center justify-center shadow-2xl">#1</div>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter truncate">{top3[0].full_name}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-3 mb-6 px-4 py-1.5 rounded-full border inline-block ${getBadgeColor(top3[0].rank_tier)}`}>{top3[0].rank_tier} Master</p>
                        <div className="text-[#BEF264] font-black text-xl uppercase tracking-tighter flex items-center justify-center gap-3">
                            <Award className="w-6 h-6" />
                            {top3[0].deals_closed} Rentals
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">
                             Successful Move-ins this Semester
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                    <div className="order-3 bg-white/5 border border-white/5 p-8 rounded-[3rem] text-center relative group hover:bg-white/10 transition-all scale-90">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-400/20 rounded-[2rem] flex items-center justify-center border border-orange-400/30 shadow-2xl">
                            <Medal className="w-10 h-10 text-orange-400" />
                        </div>
                        <div className="mt-8 mb-6 relative inline-block">
                             <div className="w-24 h-24 rounded-[2.5rem] bg-neutral-800 border-2 border-orange-400 overflow-hidden shadow-2xl">
                                <img src={top3[2].avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-neutral-900 border border-orange-400 text-orange-400 font-black rounded-xl flex items-center justify-center shadow-xl">#3</div>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate">{top3[2].full_name}</h3>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 mb-4 px-3 py-1 rounded-full border inline-block ${getBadgeColor(top3[2].rank_tier)}`}>{top3[2].rank_tier} Agent</p>
                        <div className="flex items-center justify-center gap-4 text-[#BEF264] font-black text-xs uppercase tracking-widest">
                            <TrendingUp className="w-4 h-4" />
                            {top3[2].deals_closed} Rentals
                        </div>
                    </div>
                )}
            </div>

            {/* Ranking List */}
            <div className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 text-[#BEF264]" />
                     System-Wide Rank
                </h2>
                <div className="divide-y divide-white/5 bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
                    {others.map((agent, i) => (
                        <div key={agent.agent_id} className="p-6 flex items-center justify-between hover:bg-white/[0.08] transition-all group">
                            <div className="flex items-center gap-6">
                                <span className="text-lg font-black text-gray-700 w-8">#{i + 4}</span>
                                <div className="w-12 h-12 bg-neutral-800 rounded-xl overflow-hidden border border-white/10 group-hover:border-[#BEF264]/30 transition-all">
                                    <img src={agent.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100'} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                        {agent.full_name}
                                        <ShieldCheck className="w-3.5 h-3.5 text-[#BEF264]" />
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{agent.agent_zone}</p>
                                        <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{agent.success_rate.toFixed(0)}% Success</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-[#BEF264]">{agent.deals_closed} Rentals</p>
                                <div className="flex items-center justify-end gap-1 mt-1 text-orange-400">
                                    <Star className="w-3 h-3 fill-orange-400" />
                                    <span className="text-[10px] font-black">{agent.avg_rating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {others.length === 0 && (
                         <div className="p-20 text-center text-gray-600 font-black uppercase text-xs">
                             Calculating Ranks for {filterZone}...
                         </div>
                    )}
                </div>
            </div>

            {/* My Performance Sticky Footer */}
            {myData && (
                 <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-none">
                     <div className="pointer-events-auto bg-black/90 backdrop-blur-2xl border-2 border-[#BEF264]/50 p-6 rounded-[2.5rem] shadow-[0_-20px_50px_rgba(190,242,100,0.1)] flex items-center justify-between group">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-[#BEF264] rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-xl shadow-[#BEF264]/20">
                                 #{myRank}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Your Personal Standing</p>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">You are #{myRank} out of {agents.length} agents</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 mt-1">
                                    <Zap className="w-3 h-3 text-[#BEF264]" />
                                    {myData.deals_closed < 6 ? `Need ${6 - myData.deals_closed} more rentals to reach Silver Rank` : 
                                     myData.deals_closed < 16 ? `Need ${16 - myData.deals_closed} more rentals to reach Gold Rank` : 
                                     "You've reached Gold Rank Excellence!"}
                                </p>
                            </div>
                         </div>
                         <button className="p-4 bg-white/5 rounded-2xl hover:bg-[#BEF264] hover:text-black transition-all">
                             <TrendingUp className="w-5 h-5" />
                         </button>
                     </div>
                 </div>
            )}
        </div>
    );
}
