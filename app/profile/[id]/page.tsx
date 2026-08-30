export const runtime = 'edge';
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Star, ShieldCheck, MapPin, Package, MessageCircle, ArrowLeft } from 'lucide-react';
import { SellerTrustBadge, getTrustLevel } from "@/components/ui/trust-badge";
import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';
import Image from 'next/image';

interface SellerProfileData {
    id: string;
    full_name: string;
    avatar_url: string;
    department: string;
    level: string;
    trust_level: string;
    completed_sales: number;
    avg_rating: number;
}

interface MarketItem {
    id: string;
    title: string;
    price: number;
    location: string;
    image_url: string;
    condition: string;
    status: string;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    buyer_name?: string;
}

export default function SellerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const sellerId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState<SellerProfileData | null>(null);
    const [verifiedSales, setVerifiedSales] = useState(0);
    const [items, setItems] = useState<MarketItem[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const supabase = createClient();

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            
            // 1. Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', sellerId)
                .single();
            
            // 2. Fetch REAL Verified Sales via RPC
            const { data: realSales } = await supabase
                .rpc('get_verified_sales', { seller_uuid: sellerId });
            
            // 3. Fetch Review Count
            const { count: reviewCount } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', sellerId);
            
            setVerifiedSales(realSales || 0);

            if (profile) {
                // Calculate dynamic trust level based on real sales, avg_rating, and reviewCount
                const dynamicLevel = getTrustLevel(realSales || 0, Number(profile.avg_rating) || 0, reviewCount || 0);
                setSeller({
                    ...profile,
                    trust_level: dynamicLevel
                });
            }

            // 2. Fetch Active Listings
            const { data: listings } = await supabase
                .from('market_listings')
                .select('*')
                .eq('seller_id', sellerId)
                .eq('status', 'active');
            
            if (listings) setItems(listings);

            // 3. Fetch Reviews
            const { data: sellerReviews } = await supabase
                .from('reviews')
                .select(`
                    *,
                    profiles:buyer_id(full_name)
                `)
                .eq('seller_id', sellerId)
                .order('created_at', { ascending: false });
            
            if (sellerReviews) {
                const mappedReviews = sellerReviews.map((r: any) => ({
                    ...r,
                    buyer_name: r.profiles?.full_name?.split(' ')[0] || 'Student'
                }));
                setReviews(mappedReviews);
            }

            setLoading(false);
        }

        if (sellerId) loadProfile();
    }, [sellerId, supabase]);

    if (loading) return (
        <StudentDashboardShell>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BEF264]"></div>
            </div>
        </StudentDashboardShell>
    );

    if (!seller) return (
        <StudentDashboardShell>
            <div className="text-center py-20">
                <p className="font-black text-gray-400 uppercase tracking-widest">Seller not found</p>
            </div>
        </StudentDashboardShell>
    );

    return (
        <StudentDashboardShell>
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Market</span>
                </button>

                {/* Profile Header */}
                <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-10 border border-neutral-100 dark:border-white/5 flex flex-col md:flex-row gap-10 items-center shadow-sm">
                    <div className="w-32 h-32 bg-gradient-to-tr from-[#BEF264] to-[#a6d456] rounded-[2rem] flex items-center justify-center text-4xl font-black text-black shadow-xl shadow-[#BEF264]/20 relative overflow-hidden group">
                        {seller.avatar_url ? (
                            <Image src={seller.avatar_url} alt={seller.full_name} fill className="object-cover" />
                        ) : (
                            seller.full_name[0]
                        )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{seller.full_name}</h1>
                            <SellerTrustBadge level={seller.trust_level} />
                        </div>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                            {seller.department} • {seller.level}L Student
                        </p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-2">
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                                    {verifiedSales}
                                </p>
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                    {verifiedSales > 0 ? 'Verified Sales' : '0 Sales (Manual Close)'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{seller.avg_rating}</p>
                                    <Star className="w-6 h-6 fill-[#BEF264] text-[#BEF264]" />
                                </div>
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Avg. Rating</p>
                            </div>
                        </div>
                    </div>

                    <button className="bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3">
                        <MessageCircle size={20} /> CHAT WITH SELLER
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Active Listings */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#BEF264]/10 rounded-xl">
                                <Package className="w-6 h-6 text-[#BEF264]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Active Listings</h2>
                        </div>

                        {items.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No active items listed</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {items.map(item => (
                                    <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-white/5 overflow-hidden group hover:shadow-xl transition-all">
                                        <div className="relative aspect-video overflow-hidden">
                                            <Image 
                                                src={item.image_url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop`} 
                                                alt={item.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                                                <p className="text-[#0D9488] font-black text-sm">₦{Number(item.price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">{item.title}</h3>
                                            <div className="flex items-center gap-1.5 text-gray-400 mb-4">
                                                <MapPin className="w-3 h-3 text-[#BEF264]" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{item.location}</span>
                                            </div>
                                            <button 
                                                onClick={() => router.push('/market')}
                                                className="w-full bg-gray-50 dark:bg-white/5 text-gray-400 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border border-neutral-100 dark:border-white/5 hover:text-black dark:hover:text-white transition-all"
                                            >
                                                View in Market
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Verified Reviews */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#0D9488]/10 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-[#0D9488]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Verified Reviews</h2>
                        </div>

                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-12 text-center">
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No reviews yet</p>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <div key={review.id} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 p-6 rounded-[2rem] space-y-4 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < review.rating ? "fill-[#BEF264] text-[#BEF264]" : "text-gray-200 dark:text-neutral-800"} />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 dark:bg-teal-500/10 rounded-md">
                                                <ShieldCheck size={10} className="text-teal-600" />
                                                <span className="text-[8px] font-black text-teal-600 uppercase tracking-widest">Verified</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs italic font-medium leading-relaxed">"{review.comment}"</p>
                                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-50 dark:border-white/5">
                                            <div className="w-5 h-5 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-[8px] font-black">{review.buyer_name?.[0] || 'S'}</div>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{review.buyer_name || 'Student Buyer'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentDashboardShell>
    );
}
