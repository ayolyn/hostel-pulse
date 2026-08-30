"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
    Plus, 
    Home, 
    MapPin, 
    Heart, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    Clock, 
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
    category: string;
    status: string;
    images: string[];
    verification_status: string;
    created_at: string;
}

interface LandlordListingsTabProps {
    userId: string;
    properties: Property[];
    onAddClick: () => void;
    onEditClick: (id: string) => void;
    onRefresh: () => void;
}

export default function LandlordListingsTab({ userId, properties, onAddClick, onEditClick, onRefresh }: LandlordListingsTabProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const toggleStatus = async (propertyId: string, currentStatus: string) => {
        const isActivating = currentStatus !== 'active';
        const nextStatus = isActivating ? 'active' : 'pending';
        
        const { error } = await supabase
            .from('properties')
            .update({ 
                status: nextStatus,
                verification_status: nextStatus === 'active' ? 'Verified' : 'Pending'
            })
            .eq('id', propertyId);

        if (!error) {
            onRefresh();
            toast.success(isActivating ? 'Property is now live! 🚀' : 'Property moved back to pending');
        } else {
            toast.error("Update failed: " + error.message);
        }
    };

    const deleteProperty = async (propertyId: string) => {
        if (!confirm("FORCE DELETE: Are you sure you want to remove this listing permanently?")) return;
        
        setLoading(true);
        try {
            const { error, status } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

            if (error) {
                // Hard alert to expose the secret error
                window.alert(`DATABASE ERROR (${status}): ${error.message}\n\nHint: Check RLS or Foreign Key Constraints.`);
                throw error;
            }
            
            toast.success("Listing deleted successfully (Status: 200)");
            onRefresh(); // Parent re-fetches and updates the UI
        } catch (error: any) {
            console.error('Delete Error:', error);
            toast.error("Delete failed: " + (error.message || "Unauthorized"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between bg-black p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Management Suite</h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        Monitoring {properties.length} Properties in Ogbomoso
                    </p>
                </div>
                <button 
                    disabled={loading}
                    onClick={onAddClick}
                    className="relative z-20 w-12 h-12 bg-[#BEF264] rounded-2xl flex items-center justify-center text-black hover:rotate-90 transition-all shadow-xl shadow-[#BEF264]/20 disabled:opacity-50 cursor-pointer"
                >
                    <Plus className="w-6 h-6" />
                </button>
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Building2 className="w-24 h-24" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => {
                    const mainImage = property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800';

                    return (
                        <div key={property.id} className="group relative aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                            {/* Image */}
                            <img 
                                src={mainImage} 
                                alt={property.title} 
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${property.status === 'sold' || property.status === 'rented' ? 'grayscale opacity-40' : ''}`} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                            {/* Badges */}
                            <div className="absolute top-6 left-6">
                                {property.status !== 'active' ? (
                                    <span className="px-3 py-1.5 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 bg-emerald-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 z-50">
                                <button 
                                    onClick={() => onEditClick(property.id)}
                                    className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors font-black uppercase tracking-widest text-[10px] gap-2 pointer-events-auto"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Details
                                </button>
                                <button 
                                    onClick={() => toggleStatus(property.id, property.status)}
                                    className={`px-4 py-2 backdrop-blur-md rounded-xl flex items-center justify-center transition-all font-black uppercase tracking-widest text-[10px] gap-2 pointer-events-auto ${property.status !== 'active' ? 'bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/20 hover:bg-[#a6d456]' : 'bg-white/20 text-white hover:bg-amber-500 hover:text-black'}`}
                                >
                                    <CheckCircle2 className="w-4 h-4" /> {property.status !== 'active' ? 'MARK AS COMPLETE' : 'MARK AS PENDING'}
                                </button>
                                <button 
                                    onClick={() => deleteProperty(property.id)}
                                    className="px-4 py-2 bg-red-600/80 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-colors font-black uppercase tracking-widest text-[10px] gap-2 pointer-events-auto"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>

                            {/* Title/Price */}
                            <div className="absolute bottom-0 left-0 w-full p-8 pt-20 pointer-events-none">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEF264] mb-1">{property.category}</p>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter line-clamp-1">{property.title}</h3>
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-lg font-black text-white">₦{property.price.toLocaleString()}</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-white/60" />
                                        <span className="text-[10px] text-white/60 font-bold uppercase">{property.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
