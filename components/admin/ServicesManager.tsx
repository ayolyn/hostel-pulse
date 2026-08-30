"use client";

import { useState } from "react";
import { disputeGig, cancelGig } from "@/app/actions/gigs";
import toast from "react-hot-toast";

export function ServicesManager({ services, isLoading = false }: { services: any[], isLoading?: boolean }) {
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleDispute = async (gigId: string) => {
        setIsUpdating(gigId);
        try {
            const result = await disputeGig(gigId);
            if (result.error) toast.error(result.error);
            else toast.success("Gig escalated to Dispute Center");
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleForceCancel = async (gigId: string) => {
        setIsUpdating(gigId);
        try {
            // Note: In a real scenario, admin force-cancel might need a separate action to bypass RLS,
            // but for now we can just show the button and let them try. Or we can just leave it as viewing.
            toast.error("Admin cancellation requires super_admin permissions (WIP)");
        } finally {
            setIsUpdating(null);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#1e293b] rounded-3xl p-16 border border-white/5 text-center shadow-xl flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-4 border-[#BEF264]/20 border-t-[#BEF264] rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium animate-pulse">Loading campus gigs...</p>
            </div>
        );
    }

    if (!services || services.length === 0) {
        return (
            <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 text-center shadow-xl">
                <p className="text-gray-400 font-medium">No campus gigs found.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1e293b] rounded-[3rem] p-8 border border-white/5 shadow-2xl overflow-hidden">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Campus Gigs Overview</h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Poster</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Gig / Fulfiller</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Bounty / Fee</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 text-sm font-medium text-gray-400">
                                    {new Date(service.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-4">
                                    <p className="text-sm font-bold text-white">{service.profiles?.full_name || 'Unknown User'}</p>
                                    <p className="text-xs text-gray-500">{service.profiles?.contact_email}</p>
                                </td>
                                <td className="py-4">
                                    <p className="text-sm font-bold text-white line-clamp-1">{service.service_type}</p>
                                    <p className="text-[10px] text-gray-400 font-mono mt-1">Fulfiller: {service.details?.fulfiller_id ? service.details.fulfiller_id.substring(0,8) + '...' : 'None'}</p>
                                </td>
                                <td className="py-4">
                                    <p className="text-sm font-black text-[#BEF264]">₦{Number(service.total_cost).toLocaleString()}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mt-1">Fee: ₦{Number(service.service_fee).toLocaleString()}</p>
                                </td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        service.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' :
                                        service.status === 'CLAIMED' ? 'bg-amber-500/20 text-amber-400' :
                                        service.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                        service.status === 'DISPUTED' ? 'bg-red-500/20 text-red-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {service.status}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {['OPEN', 'CLAIMED'].includes(service.status) && (
                                            <button
                                                onClick={() => handleDispute(service.id)}
                                                disabled={isUpdating === service.id}
                                                className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                            >
                                                Force Dispute
                                            </button>
                                        )}
                                        {['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(service.status) && (
                                            <span className="text-xs text-gray-500 italic">No actions available</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
