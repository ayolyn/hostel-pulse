"use client";

import React, { useState, useEffect } from 'react';
import { 
    adminGetDuplicateQueue, 
    adminApproveDuplicateListing, 
    adminMergeDuplicateListing, 
    adminRejectAndStrikeAgent 
} from '@/app/actions/duplicateModeration';
import { AdminDuplicateReviewCard, DuplicateListingItem } from './AdminDuplicateReviewCard';
import { 
    Layers, 
    ShieldCheck, 
    AlertTriangle, 
    RefreshCcw, 
    Loader2, 
    Search, 
    Filter,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function DuplicateReviewTab() {
    const [queue, setQueue] = useState<DuplicateListingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterScore, setFilterScore] = useState<'all' | 'high' | 'medium'>('all');

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const data = await adminGetDuplicateQueue();
            setQueue(data as DuplicateListingItem[]);
        } catch (err: any) {
            console.error("fetchQueue error:", err);
            toast.error("Failed to load duplicate queue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleApprove = async (id: string) => {
        await adminApproveDuplicateListing(id);
        setQueue(prev => prev.filter(x => x.id !== id));
    };

    const handleMerge = async (duplicateId: string, targetId: string) => {
        await adminMergeDuplicateListing(duplicateId, targetId);
        setQueue(prev => prev.filter(x => x.id !== duplicateId));
    };

    const handleRejectAndStrike = async (id: string, reason: string) => {
        await adminRejectAndStrikeAgent(id, reason);
        setQueue(prev => prev.filter(x => x.id !== id));
    };

    const filteredQueue = queue.filter(item => {
        const matchesSearch = 
            (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.newAgent?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.matchedListing?.title || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        const score = item.duplicate_confidence_score || 88;
        if (filterScore === 'high') return score >= 90;
        if (filterScore === 'medium') return score < 90;
        return true;
    });

    const highConfidenceCount = queue.filter(x => (x.duplicate_confidence_score || 88) >= 90).length;
    const avgScore = queue.length > 0 
        ? Math.round(queue.reduce((acc, curr) => acc + (curr.duplicate_confidence_score || 88), 0) / queue.length)
        : 0;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-2 gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-orange-400">
                        <Layers className="w-8 h-8 text-orange-400" />
                        Automated Image De-Duplication Queue
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Visual Similarity Engine • Perceptual Hash Verification
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={fetchQueue}
                        disabled={loading}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors"
                        title="Refresh Queue"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter by hostel or agent..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-orange-500/50 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-[#1e293b] rounded-3xl p-5 border border-white/5 shadow-xl">
                    <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                        Flagged Duplicates
                    </h3>
                    <div className="text-2xl font-black text-white flex items-center gap-2">
                        {queue.length}
                        <span className="text-[10px] text-orange-400 font-bold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                            Awaiting Review
                        </span>
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-3xl p-5 border border-white/5 shadow-xl">
                    <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                        High Identity Matches (≥90%)
                    </h3>
                    <div className="text-2xl font-black text-red-400">
                        {highConfidenceCount}
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-3xl p-5 border border-white/5 shadow-xl">
                    <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                        Avg Similarity Score
                    </h3>
                    <div className="text-2xl font-black text-[#BEF264]">
                        {avgScore > 0 ? `${avgScore}%` : 'N/A'}
                    </div>
                </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 px-2">
                <button
                    onClick={() => setFilterScore('all')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        filterScore === 'all'
                            ? 'bg-orange-500 text-black'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                >
                    All ({queue.length})
                </button>
                <button
                    onClick={() => setFilterScore('high')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        filterScore === 'high'
                            ? 'bg-red-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                >
                    High Risk ≥90% ({highConfidenceCount})
                </button>
                <button
                    onClick={() => setFilterScore('medium')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        filterScore === 'medium'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                >
                    Medium Risk &lt;90% ({queue.length - highConfidenceCount})
                </button>
            </div>

            {/* Review Cards List */}
            {loading ? (
                <div className="py-20 text-center space-y-4 bg-[#1e293b]/50 rounded-[2.5rem] border border-white/5">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-400 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Scanning perceptual image matrix...
                    </p>
                </div>
            ) : filteredQueue.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-[#1e293b]/50 rounded-[2.5rem] border border-white/5">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">
                        Duplicate Queue Clean
                    </h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto font-medium">
                        No pending visual collisions detected. All active listings have unique media on the platform.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredQueue.map(item => (
                        <AdminDuplicateReviewCard
                            key={item.id}
                            item={item}
                            onApprove={handleApprove}
                            onMerge={handleMerge}
                            onRejectAndStrike={handleRejectAndStrike}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
