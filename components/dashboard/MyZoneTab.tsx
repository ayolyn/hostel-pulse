'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Edit2, Trash2, Camera, Video, Clock, Heart, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { agentMarkPropertyTaken, agentRequestReactivation } from '@/app/actions/propertyModeration';

type Property = {
    id: string;
    title: string;
    price: number;
    location: string;
    zone: string;
    verification_status: string;
    status: string;
    images: string[];
    created_at: string;
    save_count?: number;
    verification_notes?: string;
};

interface MyZoneTabProps {
    userId: string;
    onAddClick: () => void;
    onEditClick: (id: string) => void;
}

export default function MyZoneTab({ userId, onAddClick, onEditClick }: MyZoneTabProps) {
    const supabase = createClient();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchMyProperties = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('id, title, price, location, verification_status, status, images, created_at, verification_notes')
                .or('owner_id.eq.' + userId + ',agent_id.eq.' + userId + ',landlord_id.eq.' + userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data as Property[]);
        } catch (error: any) {
            console.error("Error fetching properties:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchMyProperties();
    }, [userId]);

    const handleMarkTaken = async (id: string) => {
        setActionLoading(id);
        try {
            await agentMarkPropertyTaken(id);
            await fetchMyProperties();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReactivation = async (id: string) => {
        setActionLoading(id);
        try {
            await agentRequestReactivation(id);
            await fetchMyProperties();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const deleteProperty = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        setActionLoading(id);
        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            setProperties(properties.filter(p => p.id !== id));
        } catch (error: any) {
            console.error(error.message);
            alert("Delete failed: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">Listing Studio</h2>
                    <p className="text-gray-400 font-medium text-sm mt-1">{properties.length} Active & Pending Listings</p>
                </div>
                <button 
                    onClick={onAddClick}
                    className="bg-[#BEF264] text-black font-black px-6 py-3 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-[#BEF264]/10 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                >
                    + New Listing
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[4/5] bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : properties.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No properties yet</p>
                    <p className="text-gray-500 text-xs mt-2 max-w-xs mx-auto">Upload your first listing to start reaching students across Ogbomoso.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map(property => {
                        const mainImage = property.images && property.images.length > 0 ? property.images[0] : '/placeholder.jpg';
                        const isTaken = property.status === 'taken';
                        const isPending = property.status === 'pending';
                        const isChangesRequested = property.status === 'changes_requested';
                        const isRejected = property.status === 'rejected';
                        const isActive = property.status === 'active';

                        return (
                            <div key={property.id} className="group relative aspect-[4/5] bg-white/5 rounded-3xl overflow-hidden border border-white/5 hover:border-[#BEF264]/30 transition-all">
                                {/* Image Overlay */}
                                <img 
                                    src={mainImage} 
                                    alt={property.title} 
                                    className={"w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 " + (isTaken || isRejected ? 'grayscale opacity-40' : '')} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                {/* Badges */}
                                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                                    {isActive ? (
                                        <span className="px-3 py-1.5 bg-emerald-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Live
                                        </span>
                                    ) : isTaken ? (
                                        <span className="px-3 py-1.5 bg-gray-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Taken</span>
                                    ) : isPending ? (
                                        <span className="px-3 py-1.5 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Pending Review
                                        </span>
                                    ) : isChangesRequested ? (
                                        <span className="px-3 py-1.5 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Changes Requested
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Rejected</span>
                                    )}
                                </div>

                                {/* Actions Menu */}
                                <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 z-50">
                                    <button 
                                        onClick={() => onEditClick(property.id)}
                                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-[#BEF264] hover:text-black transition-colors"
                                        title="Edit Listing"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    
                                    {!isTaken && !isRejected && (
                                        <button 
                                            onClick={() => handleMarkTaken(property.id)}
                                            disabled={actionLoading === property.id}
                                            className="px-4 py-2 bg-[#BEF264] backdrop-blur-md text-black rounded-xl flex items-center justify-center transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#BEF264]/20 hover:bg-[#a6d456] disabled:opacity-50"
                                            title="Mark as Taken / Unavailable"
                                        >
                                            {actionLoading === property.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "MARK TAKEN"}
                                        </button>
                                    )}

                                    {isTaken && (
                                        <button 
                                            onClick={() => handleReactivation(property.id)}
                                            disabled={actionLoading === property.id}
                                            className="px-4 py-2 bg-amber-500 backdrop-blur-md text-black rounded-xl flex items-center justify-center transition-all font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 disabled:opacity-50"
                                            title="Request Admin Reactivation"
                                        >
                                            {actionLoading === property.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "REQUEST REACTIVATION"}
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => deleteProperty(property.id)}
                                        className="w-10 h-10 bg-red-600/80 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-colors self-end mt-2"
                                        title="Delete Listing"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Title/Info */}
                                <div className="absolute bottom-0 left-0 w-full p-5 pt-20 pointer-events-none">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEF264] mb-1">{property.verification_status}</p>
                                    {(isChangesRequested || isRejected) && property.verification_notes && (
                                        <p className="text-[10px] text-red-400 font-bold mb-1 truncate">Reason: {property.verification_notes}</p>
                                    )}
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter line-clamp-1">{property.title}</h3>
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-lg font-black text-white">₦{property.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}