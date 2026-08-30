export const runtime = 'edge';
import { createClient } from '@/lib/supabase/server';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Trophy, Star, ShieldCheck, MapPin, Search, Phone, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ProviderChatButton } from './ProviderChatButton';
import { ReviewSection } from '@/components/reviews/ReviewSection';

export default async function ProviderProfilePage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    let provider: any = null;
    let providerType: 'agent' | 'landlord' | null = null;

    // 1. Try to fetch as agent
    const { data: agent } = await supabase
        .from('agent_accounts')
        .select('*')
        .eq('id', params.id)
        .single();

    if (agent) {
        provider = {
            id: agent.id,
            full_name: agent.full_name,
            specialty: agent.specialty || 'Student Housing',
            zone: agent.zone || 'Ogbomoso',
            rank: agent.rank || 'Bronze',
            deals_closed: agent.deals_closed || 0,
            avatar_url: agent.avatar_url,
            is_approved: agent.is_approved,
            whatsapp_number: agent.whatsapp_number,
            phone: agent.phone,
            properties: agent.properties || []
        };
        providerType = 'agent';
    } else {
        // 2. Try to fetch as landlord
        const { data: landlord } = await supabase
            .from('landlord_accounts')
            .select('*')
            .eq('id', params.id)
            .single();

        if (landlord) {
            provider = {
                id: landlord.id,
                full_name: landlord.business_name || landlord.full_name,
                specialty: landlord.services_provided || 'Property Management',
                zone: landlord.office_lga || 'Ogbomoso',
                rank: 'Landlord',
                deals_closed: landlord.total_listings || 0,
                avatar_url: landlord.logo_url,
                is_approved: landlord.is_approved || landlord.is_verified,
                whatsapp_number: landlord.whatsapp_number,
                phone: landlord.phone,
                properties: []
            };
            providerType = 'landlord';
        }
    }

    if (!provider) {
        notFound();
    }

    // Auth check for current user (to see if they can review)
    const { data: { user } } = await supabase.auth.getUser();
    let canReview = false;
    
    if (user && user.id !== provider.id) {
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
            
        if (roleData?.role === 'student' || roleData?.role === 'non_student') {
            const { data: bookingData } = await supabase
                .from('bookings')
                .select('id')
                .eq('student_id', user.id)
                .eq('provider_id', provider.id)
                .eq('status', 'Completed')
                .limit(1);
                
            if (bookingData && bookingData.length > 0) {
                canReview = true;
            }
        }
    }

    // Fetch reviews
    const { data: reviewsData } = await supabase
        .from('provider_reviews')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });
        
    let reviews = reviewsData || [];
    
    if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        provider.average_rating = Number((total / reviews.length).toFixed(1));
        
        const reviewerIds = Array.from(new Set(reviews.map((r: any) => r.reviewer_id)));
        const { data: students } = await supabase.from('student_accounts').select('id, full_name, avatar_url').in('id', reviewerIds);
        
        const reviewerMap = (students || []).reduce((acc: any, student: any) => {
            acc[student.id] = student;
            return acc;
        }, {});
        
        reviews = reviews.map(r => ({
            ...r,
            reviewer: reviewerMap[r.reviewer_id] || { full_name: "Community Member" }
        }));
    }

    // 3. Fetch properties separately to guarantee a match
    const { data: providerProperties } = await supabase
        .from('properties')
        .select('id, title, location, price, images, verification_status')
        .eq('owner_id', provider.id);

    // Filter to only show live properties managed by this provider
    const listings = providerProperties || [];
    
    // Update deals closed if listings are present
    if (listings.length > 0) {
        provider.deals_closed = listings.length;
    }

    const rankColors: Record<string, string> = {
        Bronze: 'bg-orange-100 text-orange-700',
        Silver: 'bg-gray-100 text-gray-700',
        Gold: 'bg-yellow-100 text-yellow-700',
        Platinum: 'bg-[#BEF264] text-black',
        Landlord: 'bg-[#BEF264] text-black',
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <PublicHeader />

            <main className="pt-32 px-6 max-w-6xl mx-auto pb-24 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-12">

                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 text-center shadow-2xl shadow-gray-200/50 relative overflow-hidden sticky top-24">
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gray-900 rounded-t-[2.5rem]" />

                        <div className="relative z-10">
                            <div className="w-32 h-32 bg-white rounded-full mx-auto border-4 border-white shadow-xl overflow-hidden mb-4 relative flex items-center justify-center">
                                <Image
                                    src={provider.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(provider.full_name)}`}
                                    alt={provider.full_name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-1 text-center">
                                {provider.full_name}
                            </h1>

                            <div className="flex items-center justify-center gap-2 mb-6 text-gray-500">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="font-medium text-sm">{provider.zone || 'Ogbomoso Wide'}</span>
                                {provider.is_approved && (
                                    <ShieldCheck className="w-4 h-4 text-emerald-500 ml-1" />
                                )}
                            </div>

                            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm mb-8 ${rankColors[provider.rank] || rankColors.Bronze}`}>
                                {providerType === 'agent' ? `${provider.rank} Agent` : 'Verified Landlord'}
                            </span>

                            <div className="grid grid-cols-2 gap-4 pb-8 border-b border-gray-100 mb-8">
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-gray-900">{listings.length}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Total Listings</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rating</h4>
                                    <div className="flex items-center justify-center gap-1">
                                        <p className="text-2xl font-black text-gray-900">{provider.average_rating || 'New'}</p>
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    </div>
                                </div>
                            </div>

                            <ProviderChatButton providerId={provider.id} />
                            
                            <a
                                href={provider.whatsapp_number ? `https://wa.me/${provider.whatsapp_number.replace(/[^0-9]/g, '')}` : provider.phone ? `tel:${provider.phone}` : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-white border border-gray-200 text-gray-900 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mt-3"
                            >
                                <Phone className="w-4 h-4" /> {provider.whatsapp_number ? 'WhatsApp' : 'Call Provider'}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details & Listings */}
                <div className="lg:col-span-2 space-y-12 pt-6 lg:pt-0">

                    {/* About section */}
                    <section>
                        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Provider Specialty
                        </h3>
                        <p className="text-gray-500 font-medium leading-relaxed bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            {provider.specialty || `${provider.full_name} specializes in premium, secure student accommodations around ${provider.zone || 'Ogbomoso'}. Verified by HostelPulse to ensure safe transactions.`}
                        </p>
                    </section>

                    {/* Active Listings managed by this provider */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                Managed Properties ({listings.length})
                            </h3>
                        </div>

                        {listings.length === 0 ? (
                            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 text-center shadow-sm">
                                <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">No active listings</h4>
                                <p className="text-gray-500 mt-2">This provider currently has no active properties assigned to them.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {listings.map((item: any) => (
                                    <Link key={item.id} href={`/property/${item.id}`} className="block group">
                                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#BEF264]/30 transition-all h-full flex flex-col">
                                            <div className="relative h-48 overflow-hidden">
                                                <Image
                                                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5'}
                                                    fill
                                                    alt={item.title}
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
                                                <h4 className="font-black text-gray-900 leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 font-bold mb-4">
                                                    <MapPin className="w-3 h-3" />
                                                    {item.location}
                                                </div>
                                                <div className="mt-auto">
                                                    <p className="text-[#0D9488] font-black text-lg">₦{Number(item.price).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <ReviewSection 
                        providerId={provider.id} 
                        providerName={provider.full_name} 
                        reviews={reviews} 
                        canReview={canReview} 
                    />
                </div>

            </main>
        </div>
    );
}
