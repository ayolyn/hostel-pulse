"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
    Plus, 
    Home, 
    MapPin, 
    Heart, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    Building2,
    Video,
    Camera,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Property {
    id: string;
    title: string;
    price: number;
    location: string;
    zone: string;
    status: string;
    verification_status: string;
    images: string[];
    video_url?: string;
    created_at: string;
    save_count?: number;
}

interface MyZoneTabProps {
    userId: string;
    onAddClick: () => void;
    onEditClick: (id: string) => void;
}

export default function MyZoneTab({ userId, onAddClick, onEditClick }: MyZoneTabProps) {
    const supabase = createClient();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchMyProperties = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    id, title, price, location, zone, 
                    verification_status, status, images, created_at,
                    saved_properties:saved_properties(count)
                `)
                .or(`owner_id.eq.${userId},agent_id.eq.${userId},landlord_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const formattedData = data.map((p: any) => ({
                ...p,
                save_count: p.saved_properties?.[0]?.count || 0
            }));

            setProperties(formattedData);
        } catch (err) {
            console.error("Error fetching properties:", err);
            toast.error("Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProperties();
    }, [userId, supabase]);

    const toggleStatus = async (propertyId: string, currentStatus: string) => {
        console.log('Button Clicked: Publish', propertyId);
        const isActivating = currentStatus !== 'active';
        const nextStatus = isActivating ? 'active' : 'pending';
        
        const { error } = await supabase
            .from('properties')
            .update({ 
                status: nextStatus,
                verification_status: nextStatus === 'active' ? 'Verified' : 'Pending'
            })
            .eq('id', propertyId)
            .or(`owner_id.eq.${userId},agent_id.eq.${userId},landlord_id.eq.${userId}`);

        if (!error) {
            await fetchMyProperties(); // Re-fetch to update UI
            toast.success(isActivating ? 'Property is now live! 🚀' : 'Property moved back to inspection');
        } else {
            console.error('Publish Error:', error);
            toast.error("Update failed: " + error.message);
        }
    };

    const deleteProperty = async (propertyId: string) => {
        console.log('Button Clicked: Delete', propertyId);
        if (!confirm("Are you sure you want to remove this listing permanently? This cannot be undone.")) return;
        
        // Optimistic UI update: remove card instantly
        setProperties(prev => prev.filter(p => p.id !== propertyId));

        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', propertyId)
            .or(`owner_id.eq.${userId},agent_id.eq.${userId},landlord_id.eq.${userId}`);

        if (!error) {
            toast.success("Listing deleted from database");
        } else {
            console.error('Delete Error:', error);
            toast.error("Delete failed: " + error.message);
            fetchMyProperties(); // Restore state if delete failed
        }
    };

    const saveInlineEdit = async (id: string, title: string, price: number) => {
        const { error } = await supabase
            .from('properties')
            .update({ title, price })
            .eq('id', id)
            .or(`owner_id.eq.${userId},agent_id.eq.${userId},landlord_id.eq.${userId}`);

        if (!error) {
            toast.success("Listing updated");
            setEditingId(null);
            fetchMyProperties();
        } else {
            toast.error("Update failed: " + error.message);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/5] bg-white/5 rounded-3xl border border-white/5" />
                ))}
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-32 h-32 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5">
                    <Building2 className="w-16 h-16 text-white/10" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">No Listings Found</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-10 font-medium font-bold uppercase tracking-widest text-[10px]">
                    Your Zone is currently empty. Start listing properties to earn your Trust Rank.
                </p>
                <button 
                    onClick={onAddClick}
                    className="flex items-center gap-3 bg-[#BEF264] text-black font-black px-10 py-5 rounded-2xl uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#BEF264]/20"
                >
                    <Plus className="w-5 h-5" />
                    List Your First Property
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Management Suite</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
                        Monitoring {properties.length} Properties in {properties[0]?.zone || 'Your Zone'}
                    </p>
                </div>
                <button 
                    onClick={onAddClick}
                    className="w-12 h-12 bg-[#BEF264] rounded-2xl flex items-center justify-center text-black hover:rotate-90 transition-all shadow-xl shadow-[#BEF264]/10"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => {
                    const isRented = property.status !== 'active';
                    const isPending = property.verification_status === 'Pending';
                    const mainImage = property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800';

                    return (
                        <div key={property.id} className="group relative aspect-[4/5] bg-white/5 rounded-3xl overflow-hidden border border-white/5 hover:border-[#BEF264]/30 transition-all">
                            {/* Image Overlay */}
                            <img 
                                src={mainImage} 
                                alt={property.title} 
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${property.status === 'sold' || property.status === 'rented' ? 'grayscale opacity-40' : ''}`} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                            {/* Badges */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                {property.status !== 'active' ? (
                                    <span className="px-3 py-1.5 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 bg-emerald-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">✓ Active</span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <Heart className={`w-3.5 h-3.5 ${property.save_count && property.save_count > 0 ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                                <span className="text-[10px] font-black text-white">{property.save_count || 0}</span>
                            </div>

                            {/* Actions Menu */}
                            <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 z-50">
                                <button 
                                    onClick={() => {
                                        console.log('Button Clicked: Edit', property.id);
                                        onEditClick(property.id);
                                    }}
                                    className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-[#BEF264] hover:text-black transition-colors"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => toggleStatus(property.id, property.status)}
                                    className={`px-4 py-2 backdrop-blur-md rounded-xl flex items-center justify-center transition-all font-black uppercase tracking-widest text-[10px] ${property.status !== 'active' ? 'bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/20 hover:bg-[#a6d456]' : 'bg-white/10 text-white hover:bg-amber-500 hover:text-black'}`}
                                    title={property.status !== 'active' ? "Mark as complete" : "Move to Pending"}
                                >
                                    {property.status !== 'active' ? "MARK AS COMPLETE" : "UNPUBLISH"}
                                </button>
                                <button 
                                    onClick={() => deleteProperty(property.id)}
                                    className="w-10 h-10 bg-red-600/80 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Title/Info */}
                            <div className="absolute bottom-0 left-0 w-full p-5 pt-20">
                                {editingId === property.id ? (
                                    <div className="space-y-3 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-2">
                                        <input 
                                            type="text" 
                                            defaultValue={property.title}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const target = e.target as HTMLInputElement;
                                                    saveInlineEdit(property.id, target.value, property.price);
                                                }
                                            }}
                                            className="w-full bg-white/10 border border-white/5 rounded-lg px-3 py-2 text-white font-bold outline-none focus:ring-1 focus:ring-[#BEF264]"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setEditingId(null)}
                                                className="flex-1 py-2 rounded-lg bg-white/5 text-white text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                                                    saveInlineEdit(property.id, input.value, property.price);
                                                }}
                                                className="flex-1 py-2 rounded-lg bg-[#BEF264] text-black text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEF264] mb-1">{property.zone}</p>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter line-clamp-1">{property.title}</h3>
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-lg font-black text-white">₦{property.price.toLocaleString()}</p>
                                            <div className="flex items-center gap-2">
                                                {property.video_url && <Video className="w-4 h-4 text-white/40" /> }
                                                <Camera className="w-4 h-4 text-white/40" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
