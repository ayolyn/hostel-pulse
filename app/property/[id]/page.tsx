import { createClient } from '@/lib/supabase/server';
import {
    Wifi, Shield, Zap, Wind, MapPin,
    Bed, Bath, CheckCircle, Share2, Heart, ArrowLeft, Building2, Home, Car
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
                logo_url
            ),
            agent:agent_accounts (
                full_name,
                phone,
                whatsapp_number,
                avatar_url,
                rank
            )
        `)
        .eq('id', params.id)
        .single();

    if (error || !property) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
                <Building2 className="w-20 h-20 text-gray-200 mb-6" />
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Property Not Found</h1>
                <p className="text-gray-500 mb-8">The listing you're looking for doesn't exist or has been removed.</p>
                <Link href="/rent" className="bg-[#BEF264] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all">
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
        })) || [
            { icon: Zap, label: "Stable Electricity" },
            { icon: Shield, label: "Uniformed Security" },
            { icon: Wifi, label: "Fast WiFi Area" },
            { icon: Wind, label: "Cross Ventilation" }
        ];

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
                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100"><Share2 className="w-5 h-5 text-gray-700" /></button>
                    <button className="p-2 rounded-full hover:bg-gray-100"><Heart className="w-5 h-5 text-gray-700" /></button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto md:p-6 md:pt-28" id="top">
                <section className="mb-8 relative group">
                    {/* Desktop Gallery */}
                    <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[500px] rounded-3xl overflow-hidden">
                        <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition-opacity">
                            <Image src={images[0]} alt="Main" fill className="object-cover" priority />
                        </div>
                        <div className="relative cursor-pointer hover:opacity-95 transition-opacity">
                            <Image src={images[1] || images[0]} alt="Interior" fill className="object-cover" />
                        </div>
                        <div className="relative cursor-pointer hover:opacity-95 transition-opacity rounded-tr-3xl">
                            <Image src={images[2] || images[0]} alt="Detail" fill className="object-cover" />
                        </div>
                        <div className="relative cursor-pointer hover:opacity-95 transition-opacity">
                            <Image src={images[3] || images[0]} alt="Room" fill className="object-cover" />
                        </div>
                        <div className="relative cursor-pointer hover:opacity-95 transition-opacity rounded-br-3xl flex items-center justify-center bg-gray-100">
                            <Image src={images[0]} alt="More" fill className="object-cover opacity-60" />
                            <div className="relative z-10 font-bold text-gray-900 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                                View all photos
                            </div>
                        </div>
                    </div>

                    {/* Mobile Slider Placeholder */}
                    <div className="md:hidden relative h-[350px] w-full bg-gray-100">
                        <Image src={images[0]} alt="Main" fill className="object-cover" priority />
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                            1/{images.length}
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex absolute top-4 right-4 gap-3">
                        <button className="bg-white p-2.5 rounded-full shadow-md text-gray-700 hover:text-gray-900 transition-colors hover:scale-105 active:scale-95">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="bg-white p-2.5 rounded-full shadow-md text-gray-700 hover:text-red-500 transition-colors hover:scale-105 active:scale-95">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-6 md:px-0">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(property.verification_status === 'Verified' || property.verification_status === 'Live View') && (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-none flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Physically Inspected
                                    </Badge>
                                )}
                                {property.category !== 'Land' && property.bedrooms > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1">
                                        <Bed className="w-3 h-3" /> {property.bedrooms} Bedrooms
                                    </span>
                                )}
                                {property.category !== 'Land' && property.bathrooms > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1">
                                        <Bath className="w-3 h-3" /> {property.bathrooms} Baths
                                    </span>
                                )}
                                {property.category === 'Land' && property.area_size && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {property.area_size} SQM
                                    </span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1">
                                    <Home className="w-3 h-3" /> {property.category}
                                </span>
                                <Badge className={`
                                    ${property.listing_type === 'sale' || property.listing_type === 'buy' ? 'bg-orange-100 text-orange-800' : 
                                      property.listing_type === 'shortlet' ? 'bg-purple-100 text-purple-800' : 
                                      'bg-blue-100 text-blue-800'} border-none uppercase text-[10px] font-black
                                `}>
                                    For {property.listing_type === 'sale' || property.listing_type === 'buy' ? 'Sale' : property.listing_type === 'shortlet' ? 'Shortlet' : 'Rent'}
                                </Badge>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tighter leading-none">{property.title}</h1>
                            <div className="flex items-center text-gray-500 font-medium">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                {property.location}
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100" />

                        {/* Local Intelligence */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
                            {property.category === 'Land' ? (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 mb-2 flex items-center justify-center text-sm">📜</div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Documentation</p>
                                        <span className="text-[10px] font-bold mt-2 uppercase text-center line-clamp-2">
                                            {property.features?.filter((f: string) => ['C of O', 'Survey Plan', 'Deed of Assignment', 'Gazette'].includes(f)).join(', ') || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 mb-2 flex items-center justify-center text-sm">🏔️</div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Land Type</p>
                                        <span className="text-[10px] font-bold mt-2 uppercase">{property.water_source || 'Dry Land'}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                        <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Light Score</p>
                                        <div className="flex gap-0.5 mt-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                                                <div key={s} className={`w-1.5 h-3 rounded-full ${s <= (property.light_score || 7) ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold mt-2">{property.light_score || 7}/10 Rating</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 mb-2 flex items-center justify-center text-sm">💧</div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Water</p>
                                        <span className="text-[10px] font-bold mt-2 uppercase">{property.water_source || 'Borehole'}</span>
                                    </div>
                                </>
                            )}
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-500 mb-2 flex items-center justify-center text-sm">🚶</div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">{property.category === 'Land' ? 'Landmark' : 'Gate Distance'}</p>
                                <span className="text-[10px] font-bold mt-2 uppercase">{property.gate_distance || (property.category === 'Land' ? 'Not specified' : '~15 mins walk')}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 mb-2 flex items-center justify-center text-sm">🏠</div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Type</p>
                                <span className="text-[10px] font-bold mt-2 uppercase">{property.category}</span>
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
                            </div>
                        </div>
                    </div>

                    {/* Pass client actions to a separate component to keep this page Server Component */}
                    <PropertyClientActions
                        propertyId={property.id}
                        propertyName={property.title}
                        price={property.price}
                        priceLabel={property.price_label}
                        listingType={property.listing_type}
                        landlordId={property.agent_id || property.landlord_id}
                        landlord={property.landlord}
                        agent={property.agent}
                    />
                </div>
            </main>
        </div>
    );
}
