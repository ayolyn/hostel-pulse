'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Edit2, Trash2, Camera, Video, Clock, Heart, Loader2, CheckCircle2, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
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
                            {/* Image */}
                            <img 
                                src={mainImage} 
                                alt={property.title} 
                                className={"w-full h-48 sm:h-56 object-cover transition-transform duration-700 group-hover:scale-105 " + (isTaken || isRejected ? 'grayscale opacity-40' : '')} 
                            />
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                {isActive ? (
                                    <span className="px-3 py-1.5 bg-emerald-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Live
                                    </span>
                                ) : isTaken ? (
                                    <span className="px-3 py-1.5 bg-gray-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Taken</span>
                                ) : isPending ? (
                                    <span className="px-3 py-1.5 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending Review
                                    </span>
                                ) : isChangesRequested ? (
                                    <span className="px-3 py-1.5 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Changes Requested
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Rejected</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col gap-4">
                                <div>
                                    {(isChangesRequested || isRejected) && property.verification_notes && (
                                        <p className="text-[10px] text-red-400 font-bold mb-1 truncate">Reason: {property.verification_notes}</p>
                                    )}
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter line-clamp-1">{property.title}</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-lg font-black text-[#10b981] dark:text-[#BEF264]">₦{property.price.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Actions Grid */}
                                <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <button 
                                        onClick={() => onEditClick(property.id)}
                                        className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors col-span-1"
                                        title="Edit Listing"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    
                                    {!isTaken && !isRejected && (
                                        <button 
                                            onClick={() => handleMarkTaken(property.id)}
                                            disabled={actionLoading === property.id}
                                            className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition-colors col-span-1 disabled:opacity-50"
                                            title="Mark as Sold/Rented"
                                        >
                                            {actionLoading === property.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                                        </button>
                                    )}

                                    {isTaken && (
                                        <button 
                                            onClick={() => handleReactivation(property.id)}
                                            disabled={actionLoading === property.id}
                                            className="h-10 bg-amber-500 text-black rounded-xl flex items-center justify-center transition-all font-black uppercase tracking-widest text-[8px] hover:bg-amber-400 disabled:opacity-50 col-span-2"
                                            title="Request Admin Reactivation"
                                        >
                                            {actionLoading === property.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "REQUEST REACTIVE"}
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => deleteProperty(property.id)}
                                        className={`h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-500 hover:text-white transition-colors ${!isTaken && !isRejected ? 'col-span-2' : 'col-span-1'}`}
                                        title="Delete Listing"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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
