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
    CheckCircle2, Wallet, 
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

    const toggleStatus = async (propertyId: string, currentStatus: string, forceStatus?: string) => {
        const nextStatus = forceStatus || (currentStatus === 'active' ? 'pending' : 'active');
        
        const { error } = await supabase
            .from('properties')
            .update({ 
                status: nextStatus,
                is_active: nextStatus === 'active',
                verification_status: nextStatus === 'active' ? 'Verified' : (nextStatus === 'sold' ? 'Sold' : 'Pending')
            })
            .eq('id', propertyId);

        if (!error) {
            onRefresh();
            toast.success(nextStatus === 'active' ? 'Property is now live! 🚀' : `Property marked as ${nextStatus}`);
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
            <div className="flex items-center justify-between bg-black p-5 rounded-3xl text-white relative overflow-hidden">
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
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Building2 className="w-24 h-24" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => {
                    const mainImage = property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800';

                    return (
                        <div key={property.id} className="group relative aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                            {/* Image */}
                            <img 
                                src={mainImage} 
                                alt={property.title} 
                                className={`w-full h-48 sm:h-56 object-cover transition-transform duration-700 group-hover:scale-105 ${property.status === 'sold' || property.status === 'rented' ? 'grayscale opacity-40' : ''}`} 
                            />
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4">
                                {property.status === 'sold' || property.status === 'rented' ? (
                                    <span className="px-3 py-1.5 bg-gray-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                        Sold
                                    </span>
                                ) : property.status !== 'active' ? (
                                    <span className="px-3 py-1.5 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 bg-emerald-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{property.category}</p>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter line-clamp-1">{property.title}</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-lg font-black text-[#10b981] dark:text-[#BEF264]">₦{property.price.toLocaleString()}</p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase line-clamp-1">{property.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Grid */}
                                <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <button 
                                        onClick={() => onEditClick(property.id)}
                                        className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                        title="Edit Details"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => toggleStatus(property.id, property.status)}
                                        className={`h-10 rounded-xl flex items-center justify-center transition-all ${property.status !== 'active' && property.status !== 'sold' ? 'bg-[#BEF264] text-black hover:bg-[#a6d456]' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-amber-500 hover:text-black'}`}
                                        title={property.status !== 'active' ? 'Mark as Active' : 'Mark as Pending'}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => toggleStatus(property.id, property.status, property.status === 'sold' ? 'active' : 'sold')}
                                        className={`h-10 rounded-xl flex items-center justify-center transition-all ${property.status === 'sold' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white'}`}
                                        title={property.status === 'sold' ? 'Unmark Sold' : 'Mark as Sold'}
                                    >
                                        <Wallet className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => deleteProperty(property.id)}
                                        className="h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
