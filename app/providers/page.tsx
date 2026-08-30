export const runtime = 'edge';
"use client";

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Search, MapPin, Star, ShieldCheck, MessageSquare, Phone, Award, User, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { initiateDirectConversation } from '@/app/actions/messages';
import { useRouter } from 'next/navigation';

export type UnifiedProvider = {
    id: string;
    full_name: string;
    specialty: string | null;
    zone: string | null;
    rank: string;
    deals_closed: number;
    avatar_url: string | null;
    is_approved: boolean;
    whatsapp_number?: string | null;
    phone?: string | null;
    provider_type: 'agent' | 'landlord';
    average_rating?: number;
    review_count?: number;
};

export default function ProviderDirectoryPage() {
    const supabase = createClient();
    const router = useRouter();
    const [providers, setProviders] = useState<UnifiedProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [initializingChat, setInitializingChat] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProviders() {
            setLoading(true);
            const [agentsRes, landlordsRes, propertiesRes, reviewsRes] = await Promise.all([
                supabase.from('agent_accounts').select('*').eq('is_approved', true),
                supabase.from('landlord_accounts').select('*').or('is_approved.eq.true,is_verified.eq.true'),
                supabase.from('properties').select('owner_id, verification_status'),
                supabase.from('provider_reviews').select('provider_id, rating')
            ]);
            
            const livePropertyCounts = (propertiesRes.data || []).reduce((acc: Record<string, number>, curr: any) => {
                acc[curr.owner_id] = (acc[curr.owner_id] || 0) + 1;
                return acc;
            }, {});

            const ratingsAgg = (reviewsRes.data || []).reduce((acc: Record<string, { total: number, count: number }>, curr: any) => {
                if (!acc[curr.provider_id]) {
                    acc[curr.provider_id] = { total: 0, count: 0 };
                }
                acc[curr.provider_id].total += curr.rating;
                acc[curr.provider_id].count += 1;
                return acc;
            }, {});
            
            const normalizedAgents: UnifiedProvider[] = (agentsRes.data || []).map((a: any) => {
                const liveListings = livePropertyCounts[a.id] || 0;
                const stats = ratingsAgg[a.id];
                return {
                    id: a.id,
                    full_name: a.full_name,
                    specialty: a.specialty || 'Student Housing',
                    zone: a.zone || 'Ogbomoso',
                    rank: a.rank || 'Bronze',
                    deals_closed: liveListings > 0 ? liveListings : (a.deals_closed || 0),
                    avatar_url: a.avatar_url,
                    is_approved: a.is_approved,
                    whatsapp_number: a.whatsapp_number,
                    phone: a.phone,
                    provider_type: 'agent',
                    average_rating: stats ? Number((stats.total / stats.count).toFixed(1)) : 0,
                    review_count: stats ? stats.count : 0
                };
            });

            const normalizedLandlords: UnifiedProvider[] = (landlordsRes.data || []).map((l: any) => {
                const liveListings = livePropertyCounts[l.id] || 0;
                const stats = ratingsAgg[l.id];
                return {
                    id: l.id,
                    full_name: l.business_name || l.full_name || 'Verified Landlord',
                    specialty: l.services_provided || 'Property Management',
                    zone: l.office_lga || 'Ogbomoso',
                    rank: 'Landlord',
                    deals_closed: liveListings > 0 ? liveListings : (l.total_listings || 0), 
                    avatar_url: l.logo_url,
                    is_approved: l.is_approved || l.is_verified,
                    whatsapp_number: l.whatsapp_number,
                    phone: l.phone,
                    provider_type: 'landlord',
                    average_rating: stats ? Number((stats.total / stats.count).toFixed(1)) : 0,
                    review_count: stats ? stats.count : 0
                };
            });
            
            const allProviders = [...normalizedAgents, ...normalizedLandlords].sort((a,b) => b.deals_closed - a.deals_closed);
            setProviders(allProviders);
            setLoading(false);
        }
        fetchProviders();
    }, [supabase]);

    const handleChat = async (providerId: string) => {
        try {
            setInitializingChat(providerId);
            const res = await initiateDirectConversation(providerId);
            if (res.error) {
                alert(res.error);
                setInitializingChat(null);
            } else {
                router.push(`/messages/${providerId}`);
            }
        } catch (error) {
            console.error('Chat error:', error);
            alert('Failed to initialize chat');
            setInitializingChat(null);
        }
    };

    const filteredProviders = providers.filter(provider => 
        (provider.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (provider.zone?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full">
                {/* Hero Section */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
                        Find Your <span className="text-gray-400 dark:text-gray-500">Trusted</span> Provider
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
                        Verify properties in Under-G, Adenike, and General with our network of verified agents and landlords.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#BEF264] transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or area..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold text-gray-900"
                        />
                    </div>
                </div>

                {/* Agent Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white border border-gray-100 shadow-sm animate-pulse h-96 rounded-[3rem] p-8 flex flex-col gap-4">
                                <div className="flex gap-6">
                                    <div className="w-24 h-24 bg-gray-100 rounded-[2rem]" />
                                    <div className="flex flex-col gap-2 flex-1 pt-2">
                                        <div className="h-6 bg-gray-100 rounded-md w-3/4" />
                                        <div className="h-4 bg-gray-100 rounded-md w-1/2" />
                                    </div>
                                </div>
                                <div className="flex-1 mt-4 space-y-3">
                                    <div className="h-4 bg-gray-100 rounded-md w-2/3" />
                                    <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                                    <div className="h-4 bg-gray-100 rounded-md w-1/2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <div className="h-12 bg-gray-100 rounded-2xl" />
                                    <div className="h-12 bg-gray-100 rounded-2xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProviders.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center pb-32">
                        <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">No providers found</h4>
                        <p className="text-gray-500 mt-2">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                        {filteredProviders.map((provider) => (
                            <motion.div
                                key={provider.id}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col"
                            >
                                {/* Verified Badge */}
                                <div className="absolute top-6 right-6 z-10">
                                    <div className="bg-[#BEF264] text-black p-2 rounded-xl shadow-lg border border-white/20">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-gray-50 group-hover:border-[#BEF264]/20 transition-all bg-gray-100 flex items-center justify-center">
                                            <Image 
                                                src={provider.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(provider.full_name)}`} 
                                                alt={provider.full_name} 
                                                fill 
                                                sizes="96px"
                                                className="object-cover" 
                                            />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-tight mb-1">{provider.full_name}</h3>
                                        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit bg-gray-900 text-[#BEF264]">
                                            {provider.provider_type === 'landlord' ? 'Verified Landlord' : `${provider.rank || 'Bronze'} Agent`}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest">
                                        <Award className="w-4 h-4 text-[#BEF264]" />
                                        <span>Specialty: {provider.specialty || 'Student Housing'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest">
                                        <MapPin className="w-4 h-4 text-[#BEF264]" />
                                        <span>{provider.zone || 'Ogbomoso'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-[#BEF264] fill-[#BEF264]" />
                                            <span className="font-black text-gray-900">{provider.average_rating && provider.average_rating > 0 ? provider.average_rating : 'New'}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">({provider.review_count || 0} Reviews)</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        onClick={() => handleChat(provider.id)}
                                        disabled={initializingChat === provider.id}
                                        className="bg-gray-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {initializingChat === provider.id ? (
                                            <Loader2 className="w-4 h-4 text-[#BEF264] animate-spin" />
                                        ) : (
                                            <MessageSquare className="w-4 h-4 text-[#BEF264]" />
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {initializingChat === provider.id ? 'Connecting...' : 'Chat'}
                                        </span>
                                    </button>
                                    <a
                                        href={provider.whatsapp_number ? `https://wa.me/${provider.whatsapp_number.replace(/[^0-9]/g, '')}` : provider.phone ? `tel:${provider.phone}` : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#BEF264]/10 text-black p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#BEF264] transition-all"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Call</span>
                                    </a>
                                </div>

                                <div className="pt-6 border-t border-gray-50 flex justify-between items-center px-2 mt-auto">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xl font-black text-gray-900">{provider.deals_closed}</span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Total Listings</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-gray-100" />
                                    <Link href={`/providers/${provider.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-[#BEF264] transition-colors">
                                        View Full Profile →
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
