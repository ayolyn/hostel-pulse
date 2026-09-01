"use client";

import React from 'react';
import { TrendingUp, Award, Zap, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const AgentLeaderboard = () => {
    const topAgents = [
        { name: "Bolu Under-G", earned: "₦85,000", deals: 12, rank: 1 },
        { name: "Sarah Adenike", earned: "₦62,500", deals: 8, rank: 2 },
        { name: "Tunde General", earned: "₦45,000", deals: 5, rank: 3 },
    ];

    return (
        <div className="bg-black text-white p-5 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-5 opacity-10">
                <Award className="w-24 h-24 text-[#BEF264]" />
            </div>

            <div className="relative z-10 mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#BEF264]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEF264]">Top Performers</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Agent Heroes</h3>
                <p className="text-gray-500 text-xs font-medium">Top earners this week across LAUTECH zones.</p>
            </div>

            <div className="space-y-4 flex-1">
                {topAgents.map((agent) => (
                    <div key={agent.rank} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${agent.rank === 1 ? 'bg-[#BEF264] text-black' : 'bg-white/10 text-gray-400'
                                }`}>
                                {agent.rank}
                            </div>
                            <div>
                                <p className="font-black text-sm uppercase tracking-tight">{agent.name}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{agent.deals} Closures</p>
                            </div>
                        </div>
                        <p className="text-[#BEF264] font-black text-sm">{agent.earned}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <Link href="/agent" className="w-full bg-white/5 hover:bg-[#BEF264] hover:text-black p-4 rounded-xl flex items-center justify-center gap-3 transition-all group">
                    <span className="text-[10px] font-black uppercase tracking-widest">Join the Force</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default AgentLeaderboard;
