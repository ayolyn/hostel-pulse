export const runtime = 'edge';
import { createClient } from '@/lib/supabase/server';
import {
    Wifi, Shield, Zap, Wind, MapPin,
    Bed, Bath, CheckCircle, Share2, Heart, ArrowLeft, Building2, Home, Car, Search, Video, Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import PropertyClientActions from './PropertyClientActions';
import { PublicHeader } from "@/components/layout/PublicHeader";

// Helper to map string icons to Lucide components
const iconMap: Record<string, any> = {
    Zap, Shield, Wifi, Wind, MapPin, Bed, Bath, Car
};

export default async function PropertyPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    // Fetch property and join landlord_accounts
    const { data: property, error } = await supabase
        .from('properties')
        .select(`
            *,
            landlord:landlord_accounts (
                business_name,
                whatsapp_number,
                logo_url,
                is_verified,
                is_approved
            ),
            agent:agent_accounts (
                id,
                full_name,
                phone,
                whatsapp_number,
                avatar_url,
                rank,
                is_verified,
                is_approved
            )
        `)
        .eq('id', params.id)
        .single();

    if (error || !property) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
                <Building2 className="w-20 h-20 text-gray-200 mb-6" />
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Property Not Found</h1>
                <p className="text-gray-500 mb-8">The listing you're looking for doesn't exist or has been removed.</p>
                <Link href="/rent" className="bg-[#BEF264] text-black px-4 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all">
                    Browse Properties
                </Link>
            </div>
        );
    }

    const images = property.images?.length > 0 ? property.images : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2669"];

    // Map features array to amenity icons
    const amenities = property.features
        ?.filter((f: string) => f && !f.toLowerCase().includes('undefined'))
        .map((f: string) => ({
            icon: iconMap[f] || CheckCircle,
            label: f
        })) || [];

    if (property.is_furnished) amenities.push({ icon: CheckCircle, label: 'Furnished' });
    if (property.is_serviced) amenities.push({ icon: CheckCircle, label: 'Serviced' });
    if (property.is_newly_built) amenities.push({ icon: CheckCircle, label: 'Newly Built' });

    const hasVideo = Boolean(property.video_url && typeof property.video_url === 'string' && property.video_url.trim().length > 5 && property.video_url !== 'null' && property.video_url !== 'undefined');
    const validImages = Array.isArray(property.images) ? property.images.filter((img: string) => typeof img === 'string' && img.trim().length > 5 && img !== 'null' && img !== 'undefined' && !img.includes('placeholder')) : [];
    const displayImages = validImages.length > 0 ? validImages : [];

        const Watermark = () => (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center opacity-30 mix-blend-overlay">
                <div className="text-white font-black text-2xl md:text-4xl tracking-widest uppercase transform -rotate-45 drop-shadow-lg select-none flex items-center gap-3">
                    <Building2 className="w-8 h-8 md:w-12 md:h-12" /> HostelPulse
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-white pb-24 md:pb-0 relative">
            <div className="hidden md:block">
                <PublicHeader />
            </div>

            {/* Header/Nav for Mobile */}
            <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-100">
                <Link href="/rent" className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
            </div>

            <main className="max-w-7xl mx-auto md:p-6 md:pt-28" id="top">
                <section className="mb-8 relative group">
                    {/* Desktop Gallery */}
                    <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[500px] rounded-3xl overflow-hidden">
                        <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition-opacity bg-black flex flex-col items-center justify-center overflow-hidden">
                            {hasVideo ? (
                                <video src={property.video_url} autoPlay muted loop playsInline controls className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-6 flex flex-col items-center">
                                    <Video className="w-12 h-12 text-white/20 mb-4" />
                                    <p className="text-white/50 font-black uppercase tracking-widest text-xs">Raw walkthrough not available yet</p>
                                </div>
                            )}
                            <Watermark />
                            {hasVideo && property.verified_walkthrough && (
                                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20 z-30">
                                    <CheckCircle className="w-3 h-3" /> HostelPulse Verified Video
                                </div>
                            )}
                        </div>
                        <div className="relative cursor-pointer hover:opacity-95 transition-opacity overflow-hidden">
                            <Image src={(displayImages[0] || '/placeholder.jpg')} alt="Main" fill className="object-cover" priority />
                            <Watermark />
                        </div>
                        <div className="relative cursor-pointer hover:opacity-95 transition-opacity rounded-tr-3xl overflow-hidden">
                            <Image src={displayImages[1] || (displayImages[0] || '/placeholder.jpg')} alt="Interior" fill className="object-cover" />
                            <Watermark />
                        </div>
                        <div className="relative cursor-pointer hover:opacity-95 transition-opacity overflow-hidden">
                            <Image src={displayImages[2] || (displayImages[0] || '/placeholder.jpg')} alt="Room" fill className="object-cover" />
                            <Watermark />
                        </div>
                        <div className="relative cursor-pointer hover:opacity-95 transition-opacity rounded-br-3xl flex items-center justify-center bg-gray-100 overflow-hidden">
                            <Image src={displayImages[displayImages.length > 3 ? 3 : 0]} alt="More" fill className="object-cover opacity-60" />
                            <Watermark />
                            <div className="relative z-30 font-bold text-gray-900 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                                View all photos
                            </div>
                        </div>
                    </div>

                    {/* Mobile Slider Placeholder */}
                    <div className="md:hidden relative h-[350px] w-full bg-black flex items-center justify-center overflow-hidden">
                        {hasVideo ? (
                            <video src={property.video_url} autoPlay muted loop playsInline controls className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-6 flex flex-col items-center">
                                <Video className="w-12 h-12 text-white/20 mb-4" />
                                <p className="text-white/50 font-black uppercase tracking-widest text-xs">Raw walkthrough not available yet</p>
                            </div>
                        )}
                        <Watermark />
                        {hasVideo && property.verified_walkthrough && (
                            <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20 z-30">
                                <CheckCircle className="w-3 h-3" /> Verified Video
                            </div>
                        )}
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 z-30">
                            {hasVideo ? '1 Video, ' : ''}{displayImages.length} Photos
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 md:px-0">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {property.category !== 'Land' && property.bedrooms > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Bed className="w-3 h-3" /> {property.bedrooms} Bedrooms
                                    </span>
                                )}
                                {property.category !== 'Land' && property.bathrooms > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Bath className="w-3 h-3" /> {property.bathrooms} Baths
                                    </span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <Home className="w-3 h-3" /> {property.category}
                                </span>
                                <Badge className={`
                                    ${property.listing_type === 'sale' || property.listing_type === 'buy' ? 'bg-orange-100 text-orange-800' : 
                                      property.listing_type === 'shortlet' ? 'bg-purple-100 text-purple-800' : 
                                      'bg-blue-100 text-blue-800'} border-none uppercase text-[10px] font-black
                                `}>
                                    For {property.listing_type === 'sale' || property.listing_type === 'buy' ? 'Sale' : property.listing_type === 'shortlet' ? 'Shortlet' : 'Rent'}
                                </Badge>
                                {!property.is_active && (
                                    <Badge className="bg-red-100 text-red-800 border-none uppercase text-[10px] font-black">
                                        Unavailable
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-xl sm:text-2xl md:text-2xl sm:text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter leading-none">{property.title}</h1>
                            <div className="flex items-center text-gray-500 font-bold text-sm">
                                <MapPin className="w-4 h-4 mr-1 text-[#BEF264]" />
                                {property.location}
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100" />

                        {/* Verification Status Block */}
                        <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 mb-8">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Verification Status</h3>
                            
                            {(() => {
                                const status = (property.verification_status || '').toLowerCase();
                                const isAgentVerified = Array.isArray(property.agent) ? (property.agent[0]?.is_verified || property.agent[0]?.is_approved) : (property.agent?.is_verified || property.agent?.is_approved);
                                const isLandlordVerified = Array.isArray(property.landlord) ? (property.landlord[0]?.is_verified || property.landlord[0]?.is_approved) : (property.landlord?.is_verified || property.landlord?.is_approved);
                                const isProviderVerified = isAgentVerified || isLandlordVerified;
                                
                                let color = 'text-gray-900';
                                let label = 'UNVERIFIED';
                                let desc = 'This property has not been verified by HostelPulse.';
                                let date = '';
                                let shieldColor = 'text-gray-500';
                                let shieldBg = 'bg-gray-200';

                                if (status === 'physically inspected') {
                                    color = 'text-emerald-700';
                                    shieldBg = 'bg-emerald-100';
                                    shieldColor = 'text-emerald-600';
                                    label = 'PHYSICALLY INSPECTED';
                                    desc = 'HostelPulse physically inspected this property.';
                                    date = property.verified_at ? 'Last inspected: ' + new Date(property.verified_at).toLocaleDateString() : '';
                                } else if (status === 'details checked') {
                                    color = 'text-blue-700';
                                    shieldBg = 'bg-blue-100';
                                    shieldColor = 'text-blue-600';
                                    label = 'DETAILS CHECKED';
                                    desc = 'Listing details were checked by HostelPulse.';
                                    date = property.verified_at ? 'Last checked: ' + new Date(property.verified_at).toLocaleDateString() : '';
                                } else if (property.is_verified || status.includes('verified')) {
                                    color = 'text-emerald-700';
                                    shieldBg = 'bg-emerald-100';
                                    shieldColor = 'text-emerald-600';
                                    label = 'VERIFIED BY HOSTELPULSE';
                                    desc = 'This property is verified by HostelPulse.';
                                    date = property.verified_at ? 'Verified on: ' + new Date(property.verified_at).toLocaleDateString() : '';
                                } else if (isProviderVerified) {
                                    color = 'text-emerald-700';
                                    shieldBg = 'bg-emerald-100';
                                    shieldColor = 'text-emerald-600';
                                    label = 'VERIFIED';
                                    desc = 'This provider is a verified member on HostelPulse.';
                                    date = '';
                                } else if (status === 'pending review' || status === 'pending') {
                                    color = 'text-amber-700';
                                    shieldBg = 'bg-amber-100';
                                    shieldColor = 'text-amber-600';
                                    label = 'PENDING REVIEW';
                                    desc = 'This listing is waiting for HostelPulse review.';
                                    date = '';
                                } else {
                                    color = 'text-gray-700';
                                    shieldBg = 'bg-gray-100';
                                    shieldColor = 'text-gray-500';
                                    label = 'UNVERIFIED';
                                    desc = 'This property has not been verified by HostelPulse.';
                                    date = '';
                                }

                                return (
                                    <>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${shieldBg} ${shieldColor}`}>
                                                <Shield className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className={`font-black uppercase tracking-tight text-lg ${color}`}>{label}</p>
                                                <p className="text-xs text-gray-500 font-medium mt-1">{desc}</p>
                                                {date && <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{date}</p>}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                            
                            {(property.address_confirmed || property.price_confirmed || property.agent_confirmed || property.availability_confirmed) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                                    {property.address_confirmed && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm text-gray-900 font-bold">Address Confirmed</span>
                                        </div>
                                    )}
                                    {property.price_confirmed && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm text-gray-900 font-bold">Price Confirmed</span>
                                        </div>
                                    )}
                                    {property.agent_confirmed && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm text-gray-900 font-bold">Agent Confirmed</span>
                                        </div>
                                    )}
                                    {property.availability_confirmed && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm text-gray-900 font-bold">Availability Confirmed</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Local Intelligence */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 mb-2 flex items-center justify-center text-sm">💧</div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Water Source</p>
                                <span className="text-[10px] font-bold mt-2 uppercase">{property.water_source || 'Not provided'}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-500 mb-2 flex items-center justify-center text-sm"><Zap className="w-4 h-4" /></div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Light Score</p>
                                <span className="text-[10px] font-bold mt-2 uppercase">{property.light_score ? `${property.light_score}/10` : 'Not provided'}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-500 mb-2 flex items-center justify-center text-sm">🚶</div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">{property.category === 'Land' ? 'Landmark' : 'Gate Distance'}</p>
                                <span className="text-[10px] font-bold mt-2 uppercase">{property.gate_distance || 'Not provided'}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 mb-2 flex items-center justify-center text-sm">🏠</div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Available From</p>
                                <span className="text-[10px] font-bold mt-2 uppercase">{property.available_from ? new Date(property.available_from).toLocaleDateString() : 'Not provided'}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">About this property</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                {property.description || 'No description provided for this listing.'}
                            </p>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100" />

                        {/* Property Details */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Property Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reference ID</p>
                                    <p className="font-bold text-gray-900 mt-1 uppercase">{property.id.split('-')[0]}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Property Type</p>
                                    <p className="font-bold text-gray-900 mt-1 uppercase">{property.category}</p>
                                </div>
                                {property.category !== 'Land' && (
                                    <>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bedrooms</p>
                                            <p className="font-bold text-gray-900 mt-1 uppercase">{property.bedrooms || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bathrooms</p>
                                            <p className="font-bold text-gray-900 mt-1 uppercase">{property.bathrooms || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Toilets</p>
                                            <p className="font-bold text-gray-900 mt-1 uppercase">{property.toilets || 0}</p>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Area Size</p>
                                    <p className="font-bold text-gray-900 mt-1 uppercase">{property.area_size ? `${property.area_size} SQM` : 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100" />

                        {/* Amenities */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Amenities & Features</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                                {amenities.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 text-gray-600 font-medium">
                                        <item.icon className="w-5 h-5 text-gray-400" />
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                                {amenities.length === 0 && (
                                    <p className="text-gray-500 font-medium">No amenities listed.</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="w-full h-[1px] bg-gray-100" />
                        
                        {/* Disclaimer */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Disclaimer
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                The information provided about this property is for general informational purposes only. All details are subject to verification by the prospective tenant or buyer. HostelPulse does not guarantee the accuracy of all information provided by agents or landlords unless marked as &quot;HostelPulse Verified&quot;. We strongly recommend inspecting the property physically before making any payments.
                            </p>
                        </div>
                    </div>

                    {/* Pass client actions to a separate component to keep this page Server Component */}
                    <PropertyClientActions
                        propertyId={property.id}
                        propertyName={property.title}
                        isActive={property.is_active !== false}
                        isVerified={property.is_verified || (property.verification_status || '').toLowerCase().includes('verified') || (Array.isArray(property.agent) ? (property.agent[0]?.is_verified || property.agent[0]?.is_approved) : (property.agent?.is_verified || property.agent?.is_approved)) || (Array.isArray(property.landlord) ? (property.landlord[0]?.is_verified || property.landlord[0]?.is_approved) : (property.landlord?.is_verified || property.landlord?.is_approved))}
                        annualRent={property.price}
                        agentFee={property.agent_fee}
                        agreementFee={property.agreement_fee}
                        cautionFee={property.caution_fee}
                        inspectionFee={property.inspection_fee}
                        serviceCharge={property.service_charge}
                        otherFees={property.other_fee}
                        otherFeeDescription={property.other_fee_description}
                        totalMoveInCost={property.total_move_in_cost}
                        listingType={property.listing_type}
                        landlordId={property.agent_id || property.landlord_id}
                        landlord={Array.isArray(property.landlord) ? property.landlord[0] : property.landlord}
                        agent={Array.isArray(property.agent) ? property.agent[0] : property.agent}
                    />
                </div>
            </main>
        </div>
    );
}


