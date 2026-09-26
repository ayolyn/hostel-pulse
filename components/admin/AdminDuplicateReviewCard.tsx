"use client";

import React, { useState } from 'react';
import { 
    CheckCircle2, 
    AlertTriangle, 
    Layers, 
    ShieldAlert, 
    Calendar, 
    Phone, 
    MapPin, 
    ExternalLink, 
    Loader2, 
    Flame, 
    User,
    ArrowRightLeft,
    Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface DuplicateListingItem {
    id: string;
    title: string;
    price: number;
    location: string;
    category?: string;
    images: string[];
    status: string;
    created_at: string;
    duplicate_confidence_score: number;
    duplicate_flagged_image?: string | null;
    newAgent: {
        id: string;
        name: string;
        phone: string;
        email: string;
        avatar?: string | null;
        strikes: number;
    } | null;
    matchedListing: {
        id: string;
        title: string;
        price: number;
        location: string;
        category?: string;
        images: string[];
        status: string;
        created_at: string;
        originalAgent: {
            id: string;
            name: string;
            phone: string;
            email: string;
            avatar?: string | null;
            strikes: number;
        } | null;
    } | null;
}

interface AdminDuplicateReviewCardProps {
    item: DuplicateListingItem;
    onApprove: (id: string) => Promise<void>;
    onMerge: (duplicateId: string, targetId: string) => Promise<void>;
    onRejectAndStrike: (id: string, reason: string) => Promise<void>;
}

export function AdminDuplicateReviewCard({
    item,
    onApprove,
    onMerge,
    onRejectAndStrike
}: AdminDuplicateReviewCardProps) {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [activeImgLeft, setActiveImgLeft] = useState(0);
    const [activeImgRight, setActiveImgRight] = useState(0);

    const score = item.duplicate_confidence_score || 88;
    const scoreColor = score >= 95 
        ? 'bg-red-500/20 text-red-400 border-red-500/40' 
        : score >= 90 
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' 
        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';

    const handleApprove = async () => {
        if (!confirm(`Approve "${item.title}" as a legitimate separate listing? It will be marked ACTIVE.`)) return;
        setLoadingAction('approve');
        try {
            await onApprove(item.id);
            toast.success("Listing approved as legitimate!");
        } catch (err: any) {
            toast.error(err.message || "Failed to approve listing");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleMerge = async () => {
        if (!item.matchedListing) {
            toast.error("No target listing to merge with");
            return;
        }
        if (!confirm(`Merge new listing into existing hostel "${item.matchedListing.title}"? The new agent will be linked and duplicate listing closed.`)) return;
        setLoadingAction('merge');
        try {
            await onMerge(item.id, item.matchedListing.id);
            toast.success("Listing merged successfully!");
        } catch (err: any) {
            toast.error(err.message || "Failed to merge listing");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleReject = async () => {
        const reason = prompt("Enter violation reason for rejecting this listing and issuing a strike:", "Duplicate media uploaded without authorization.");
        if (reason === null) return;
        setLoadingAction('reject');
        try {
            await onRejectAndStrike(item.id, reason);
            toast.success("Listing rejected and strike logged against agent!");
        } catch (err: any) {
            toast.error(err.message || "Failed to reject listing");
        } finally {
            setLoadingAction(null);
        }
    };

    const newListingImg = item.duplicate_flagged_image || item.images[activeImgRight] || '/placeholder.png';
    const existingListingImg = item.matchedListing?.images?.[activeImgLeft] || '/placeholder.png';

    return (
        <div className="bg-[#1e293b] rounded-[2.5rem] p-6 border border-white/10 hover:border-orange-500/30 transition-all shadow-2xl space-y-6">
            {/* Top Match Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                        <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Duplicate Verification Alert
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${scoreColor}`}>
                                {score}% Visual Match
                            </span>
                        </div>
                        <h4 className="text-white font-black text-sm mt-0.5">
                            Visual Collision Detected • {item.location}
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500">ID: {item.id.slice(0, 8)}</span>
                </div>
            </div>

            {/* Side-by-Side Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Visual Match Badge in the Middle on Desktop */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#0f172a] border border-orange-500/40 items-center justify-center text-orange-400 shadow-xl font-black text-xs">
                    VS
                </div>

                {/* LEFT SIDE: Existing Verified Listing */}
                <div className="bg-black/30 rounded-3xl p-5 border border-white/5 space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Original On-Platform
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                {item.matchedListing?.created_at ? new Date(item.matchedListing.created_at).toLocaleDateString() : 'Existing'}
                            </span>
                        </div>

                        {/* Image Preview */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 group">
                            {existingListingImg ? (
                                <img 
                                    src={existingListingImg} 
                                    alt="Existing Hostel" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <ImageIcon className="w-8 h-8 opacity-40" />
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider text-emerald-400">
                                Primary Reference
                            </div>
                        </div>

                        {/* Existing Property Info */}
                        <div className="mt-4 space-y-1">
                            <h5 className="text-white font-black text-base truncate">
                                {item.matchedListing?.title || 'Unknown Existing Property'}
                            </h5>
                            <p className="text-[#BEF264] font-black text-sm">
                                ₦{item.matchedListing?.price ? Number(item.matchedListing.price).toLocaleString() : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                {item.matchedListing?.location || 'Unknown Location'}
                            </p>
                        </div>
                    </div>

                    {/* Original Agent Details */}
                    <div className="pt-3 border-t border-white/5 mt-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Original Lister</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                                    {item.matchedListing?.originalAgent?.avatar ? (
                                        <img src={item.matchedListing.originalAgent.avatar} alt="Agent" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-emerald-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white truncate max-w-[120px]">
                                        {item.matchedListing?.originalAgent?.name || 'Verified Landlord'}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {item.matchedListing?.originalAgent?.phone || 'No phone'}
                                    </p>
                                </div>
                            </div>

                            {item.matchedListing?.id && (
                                <a 
                                    href={`/property/${item.matchedListing.id}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    title="View Original Property Page"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: New Flagged Upload */}
                <div className="bg-black/30 rounded-3xl p-5 border border-orange-500/20 space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                                Flagged Upload
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}
                            </span>
                        </div>

                        {/* Image Preview */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-orange-500/30 group">
                            {newListingImg ? (
                                <img 
                                    src={newListingImg} 
                                    alt="Uploaded Hostel" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <ImageIcon className="w-8 h-8 opacity-40" />
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-orange-500/90 text-black text-[9px] font-black uppercase tracking-wider">
                                {score}% Match with Original
                            </div>
                        </div>

                        {/* New Property Info */}
                        <div className="mt-4 space-y-1">
                            <h5 className="text-white font-black text-base truncate">
                                {item.title || 'Untitled Upload'}
                            </h5>
                            <p className="text-orange-400 font-black text-sm">
                                ₦{item.price ? Number(item.price).toLocaleString() : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                {item.location || 'Ogbomoso'}
                            </p>
                        </div>
                    </div>

                    {/* New Agent Details & Strikes */}
                    <div className="pt-3 border-t border-white/5 mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Uploading Agent</p>
                            {item.newAgent?.strikes !== undefined && (
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    item.newAgent.strikes >= 2 
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                                        : item.newAgent.strikes === 1
                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                                        : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                    <Flame className="w-2.5 h-2.5" />
                                    {item.newAgent.strikes} strike{item.newAgent.strikes === 1 ? '' : 's'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                                    {item.newAgent?.avatar ? (
                                        <img src={item.newAgent.avatar} alt="Agent" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-purple-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white truncate max-w-[120px]">
                                        {item.newAgent?.name || 'New Agent'}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {item.newAgent?.phone || 'No phone'}
                                    </p>
                                </div>
                            </div>

                            <a 
                                href={`/property/${item.id}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                title="Preview Uploaded Listing"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Quick Action Buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Approve as Legitimate */}
                <button
                    onClick={handleApprove}
                    disabled={!!loadingAction}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                    {loadingAction === 'approve' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4" />
                    )}
                    Approve as Legitimate
                </button>

                {/* 2. Merge with Existing */}
                <button
                    onClick={handleMerge}
                    disabled={!!loadingAction || !item.matchedListing}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                    {loadingAction === 'merge' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Layers className="w-4 h-4" />
                    )}
                    Merge with Existing
                </button>

                {/* 3. Reject & Issue Strike */}
                <button
                    onClick={handleReject}
                    disabled={!!loadingAction}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                    {loadingAction === 'reject' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ShieldAlert className="w-4 h-4" />
                    )}
                    Reject & Issue Strike
                </button>
            </div>
        </div>
    );
}
