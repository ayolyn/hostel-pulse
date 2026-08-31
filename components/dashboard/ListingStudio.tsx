"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Home, MapPin, Building2, Zap, CheckCircle2, RefreshCcw, ShieldCheck, Loader2, Store, TreePine, UploadCloud, X, Image as ImageIcon , Camera} from 'lucide-react';
import { LocationCombobox } from '@/components/ui/LocationCombobox';
import toast from 'react-hot-toast';

type Category = 'Hostel' | 'Shop' | 'House' | 'Hotel' | 'Land';

function getListingType(category: Category): string {
    if (category === 'House' || category === 'Land' || category === 'Shop') return 'buy';
    return 'rent'; // Hostel, Hotel
}


function getPriceLabel(category: Category): string {
    if (category === 'Hotel') return 'Daily Rate';
    if (category === 'House' || category === 'Land') return 'Sale Price';
    if (category === 'Shop') return 'Monthly Rent';
    return 'Yearly Rent';
}

export function ListingStudio({ onComplete, editId: propEditId }: { onComplete: () => void, editId?: string | null }) {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<Category>('Hostel');
    const [subCat, setSubCat] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [error, setError] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [hasTerms, setHasTerms] = useState(false);
    const [isCheckingTerms, setIsCheckingTerms] = useState(true);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setIsCheckingTerms(false); return; }

            // Check terms
            const { data: profile } = await supabase.from('profiles').select('terms_accepted_at').eq('id', user.id).single();
            setHasTerms(!!profile?.terms_accepted_at);
            setIsCheckingTerms(false);

            const id = propEditId || searchParams.get('edit');
            if (!id) {
                setEditId(null);
                setForm({
                    title: '',
                    price: '',
                    description: '',
                    location: 'Under-G Area',
                    bedrooms: '1',
                    bathrooms: '1',
                    toilets: '1',
                    area_size: '',
                    is_furnished: false,
                    is_serviced: false,
                    is_newly_built: false,
          video_url: '',
                    youtube_video_url: '',
                    instagram_video_url: '',
                    virtual_tour_url: '',
                    features: [],
                    light_score: 7,
                    water_source: 'Borehole',
                    gate_distance: '~15 mins walk',
                    listing_type: 'rent',
                    road_access: 'Tarred'
                });
                setUploadedImageUrls([]);
                setStep(1);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .or(`agent_id.eq.${user.id},landlord_id.eq.${user.id}`)
                .single();

            if (data && !error) {
                setEditId(id);
                setCategory(data.category === 'House' ? 'House' : data.category as Category);
                setForm({
                    title: data.title || '',
                    price: data.price?.toString() || '',
                    description: data.description || '',
                    location: data.location || 'Under-G Area',
                    bedrooms: data.bedrooms?.toString() || '1',
                    bathrooms: data.bathrooms?.toString() || '1',
                    toilets: data.toilets?.toString() || '1',
                    area_size: data.area_size || '',
                    is_furnished: data.is_furnished || false,
                    is_serviced: data.is_serviced || false,
                    is_newly_built: data.is_newly_built || false,
                      video_url: data.video_url || '',
                    youtube_video_url: data.youtube_video_url || '',
                    instagram_video_url: data.instagram_video_url || '',
                    virtual_tour_url: data.virtual_tour_url || '',
                    features: data.features || [],
                    light_score: data.light_score || 7,
                    water_source: data.water_source || 'Borehole',
                    gate_distance: data.gate_distance || '~15 mins walk',
                    listing_type: data.listing_type || 'rent',
                    road_access: data.features?.find((f: string) => f.startsWith('Road Access:'))?.replace('Road Access: ', '') || 'Tarred'
                });
                setUploadedImageUrls(data.images || []);
                setStep(3); // Skip to details
            }
            setLoading(false);
        };

        fetchInitialData();
    }, [searchParams, supabase, propEditId]);

    const [form, setForm] = useState({
        title: '',
        price: '',
        description: '',
        location: 'Under-G Area',
        bedrooms: '1',
        bathrooms: '1',
        toilets: '1',
        area_size: '',
        is_furnished: false,
        is_serviced: false,
        is_newly_built: false,
          video_url: '',
        youtube_video_url: '',
        instagram_video_url: '',
        virtual_tour_url: '',
        features: [] as string[],
        light_score: 7,
        water_source: 'Borehole',
        gate_distance: '~15 mins walk',
        road_access: 'Tarred', // For Land
        listing_type: 'rent' as string
    });


    const toggleFeature = (f: string) => {
        setForm(prev => ({
            ...prev,
            features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f]
        }));
    };

    // Upload images to Supabase Storage
    const handleImageUpload = async (files: FileList) => {
        if (!files.length) return;
        setUploadingImages(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setUploadingImages(false); return; }

        const uploaded: string[] = [];
        for (const file of Array.from(files)) {
            const ext = file.name.split('.').pop();
            const path = `properties/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { data, error } = await supabase.storage
                .from('property-images')
                .upload(path, file, { upsert: false, cacheControl: '3600' });

            if (!error && data) {
                const { data: urlData } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(data.path);
                uploaded.push(urlData.publicUrl);
            } else {
                console.error('Image upload error:', error?.message);
            }
        }
        setUploadedImageUrls(prev => [...prev, ...uploaded]);
        setUploadingImages(false);
    };

    
    const handleVideoUpload = async (file: File) => {
        if (!file) return;
        if (file.size > 25 * 1024 * 1024) {
            toast.error('Video must be less than 25MB');
            return;
        }
        setUploadingVideo(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setUploadingVideo(false); return; }

        const ext = file.name.split('.').pop();
        const path = `properties/videos/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage
            .from('market-images') // reuse existing public bucket
            .upload(path, file, { upsert: false, cacheControl: '3600' });

        if (!error && data) {
            const { data: urlData } = supabase.storage
                .from('market-images')
                .getPublicUrl(data.path);
            setForm(prev => ({ ...prev, video_url: urlData.publicUrl }));
            toast.success('Video uploaded successfully!');
        } else {
            console.error('Video upload error:', error?.message);
            toast.error('Failed to upload video');
        }
        setUploadingVideo(false);
    };

    const removeImage = (url: string) => {
        setUploadedImageUrls(prev => prev.filter(u => u !== url));
    };

    const FALLBACK_IMAGES: Record<Category, string> = {
        Hostel: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800',
        Shop: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800',
        House: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
        Hotel: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800',
        Land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800',
    };

    const submitListing = async () => {
        if (!form.title.trim()) { setError('Please enter a listing title.'); return; }
        if (!form.price.trim()) { setError('Please enter a price.'); return; }

        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); setError('You must be logged in.'); return; }

        const priceNum = Number(form.price.replace(/\D/g, ''));
        const imagesToUse = uploadedImageUrls.length > 0 ? uploadedImageUrls : [FALLBACK_IMAGES[category]];

        const { data: userRoles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
        const roles = userRoles?.map((r: { role: string }) => r.role) || [];
        const isAgent = roles.includes('agent');
        const isLandlord = roles.includes('landlord');

        const payload = {
            owner_id: user.id,
            agent_id: isAgent ? user.id : null,
            landlord_id: isLandlord ? user.id : null,
            title: form.title || `${category} in ${form.location}`,
            description: form.description || `A premium ${subCat || category} located in ${form.location}, Ogbomoso.`,
            location: form.location,
            price: priceNum,
            category: category,
            listing_type: form.listing_type || getListingType(category),
            price_label: getPriceLabel(category),
            bedrooms: Number(form.bedrooms) || 1,
            bathrooms: Number(form.bathrooms) || 1,
            toilets: Number(form.toilets) || 0,
            area_size: form.area_size,
            is_furnished: form.is_furnished,
            is_serviced: form.is_serviced,
            is_newly_built: form.is_newly_built,
            video_url: form.video_url,
              youtube_video_url: form.youtube_video_url,
            instagram_video_url: form.instagram_video_url,
            virtual_tour_url: form.virtual_tour_url,
            features: form.features.length > 0 ? form.features : (category === 'Land' ? [] : ['Constant Power', 'Running Water']),
            light_score: category === 'Land' ? null : Number(form.light_score),
            water_source: form.water_source,
            gate_distance: form.gate_distance,

            images: imagesToUse,
            status: 'active',
            verification_status: 'Verified',
            view_count: 0,
        };

        // Append road access for Land
        if (category === 'Land') {
            payload.features.push(`Road Access: ${form.road_access}`);
        }


        let resultId = editId;
        if (editId) {
            const { error: updateError } = await supabase
                .from('properties')
                .update(payload)
                .eq('id', editId)
                .or(`agent_id.eq.${user.id},landlord_id.eq.${user.id}`);
            
            if (updateError) {
                setLoading(false);
                setError("Update failed: " + updateError.message);
                return;
            }
        } else {
            const { data: newProperty, error: insertError } = await supabase
                .from('properties')
                .insert(payload)
                .select('id')
                .single();

            if (insertError) {
                setLoading(false);
                setError("Upload failed: " + insertError.message);
                return;
            }
            resultId = newProperty?.id;
        }

        // Update property_details if bedroom/bathroom info exists
        if (resultId && (category === 'Hostel' || category === 'House' || category === 'Hotel')) {
            const detailsPayload = {
                property_id: resultId,
                bedrooms: Number(form.bedrooms) || 1,
                bathrooms: Number(form.bathrooms) || 1,
            };

            if (editId) {
                await supabase.from('property_details').upsert(detailsPayload, { onConflict: 'property_id' });
            } else {
                await supabase.from('property_details').insert(detailsPayload);
            }
        }

        setLoading(false);
        setStep(4);
    };

    if (isCheckingTerms) return <div className="p-20 text-center animate-pulse">Checking credentials...</div>;

    if (!hasTerms) {
        return (
            <div className="p-20 text-center space-y-10 bg-white dark:bg-neutral-950 rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-12 h-12 text-red-500" />
                </div>
                <div className="max-w-md mx-auto">
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Legal Guard Active</h3>
                    <p className="text-[11px] font-bold text-gray-400 mt-4 uppercase tracking-[0.2em] italic leading-relaxed">
                        "In Ogbomoso, we keep things professional. You must accept the Professional Terms of Service in your profile before you can list properties."
                    </p>
                </div>
                <button 
                    onClick={async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;
                        const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
                        const target = data?.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/agent';
                        router.push(`${target}?tab=profile`);
                    }}
                    className="bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                >
                    Update Official Profile
                </button>
            </div>
        );
    }

    // ─── STEP 1: Choose Category ────────────────────────────────────────────
    if (step === 1) return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-black p-10 rounded-[2.5rem] text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tight">Listing Studio</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Ogbomoso Master Inventory</p>
                </div>
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Building2 className="w-32 h-32" />
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { id: 'Hostel', label: 'Hostel', icon: Home, desc: 'Student Rent' },
                    { id: 'Shop', label: 'Shop', icon: Store, desc: 'Commercial' },
                    { id: 'House', label: 'House', icon: Building2, desc: 'For Sale' },
                    { id: 'Hotel', label: 'Hotel', icon: Zap, desc: 'Shortlet' },
                    { id: 'Land', label: 'Land', icon: TreePine, desc: 'Plot/Land' },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => { 
                            setCategory(cat.id as Category); 
                            setForm(prev => ({ ...prev, listing_type: getListingType(cat.id as Category) }));
                            setStep(2); 
                        }}
                        className="p-8 border-[3px] border-gray-50 rounded-[2.5rem] text-center hover:border-[#BEF264] hover:bg-[#BEF264]/5 transition-all group relative overflow-hidden"
                    >
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#BEF264] group-hover:text-black transition-all">
                            <cat.icon className="w-6 h-6" />
                        </div>
                        <p className="font-black text-xl uppercase tracking-tighter group-hover:scale-110 transition-transform">{cat.label}</p>
                        <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#BEF264]">{cat.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );

    // ─── STEP 2: Sub-Category ────────────────────────────────────────────────
    const subOptions: Record<Category, { title: string; desc: string }[]> = {
        Hostel: [
            { title: 'Hostel Pod', desc: 'Classic bunking room' }, 
            { title: 'Self-Contain', desc: 'Private student living' },
            { title: 'Single Room', desc: 'A room for one student' },
            { title: 'Flat', desc: 'Full apartment unit' },
            { title: 'Room in a flat', desc: 'Shared flat, private room' }
        ],
        Shop: [
            { title: 'Market Stall', desc: 'General / Takie Market' }, 
            { title: 'Office Space', desc: 'Under-G Hub Area' },
            { title: 'Shop in student area', desc: 'High foot traffic near campus' }
        ],
        House: [{ title: 'Completed Duplex', desc: 'Modern family home' }, { title: 'Bungalow', desc: 'Single floor house' }],
        Hotel: [{ title: 'Executive Shortlet', desc: 'Daily rate / Wifi / AC' }, { title: 'Budget Guesthouse', desc: 'Comfortable & Secure' }],
        Land: [{ title: 'Residential Land', desc: 'Plots with survey papers' }, { title: 'Commercial Land', desc: 'Business or mixed use' }],
    };

    if (step === 2) return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900">{category} Details</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select sub-category</p>
                </div>
                <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all">← Category</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subOptions[category].map((type) => (
                    <button key={type.title} onClick={() => { setSubCat(type.title); setStep(3); }}
                        className="p-6 border-2 border-gray-100 rounded-3xl text-left hover:border-[#BEF264] hover:bg-[#BEF264]/5 transition-all group flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-[#BEF264] transition-all">
                            <Building2 className="w-5 h-5 group-hover:text-black" />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 uppercase tracking-tight">{type.title}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{type.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // ─── STEP 3: Listing Details ─────────────────────────────────────────────
    if (step === 3) return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Listing Details</h2>
                    <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Fill in accurate information</p>
                </div>
                <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-all">← Back</button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl px-4 py-3">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Listing Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder={`e.g. ${subCat} in Under-G`}
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Price (₦) * — {getPriceLabel(category)}</label>
                    <input type="text" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                        placeholder="350000"
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                </div>

                {/* Listing Type Toggle (For House and Shop) */}
                {(category === 'House' || category === 'Shop') && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Listing Type</label>
                        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-neutral-900 rounded-2xl border-2 border-transparent">
                            {['rent', 'buy'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setForm({ ...form, listing_type: type })}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.listing_type === type ? 'bg-[#BEF264] text-black shadow-sm' : 'text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300'}`}
                                >
                                    For {type === 'buy' ? 'Sale' : 'Rent'}
                                </button>
                            ))}
                        </div>

                    </div>
                )}

                {/* Bedrooms, Bathrooms, Toilets & Area Size (not for Land/Shop) */}
                {category !== 'Land' && category !== 'Shop' && (
                    <>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Bedrooms</label>
                            <input type="number" min="1" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })}
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Bathrooms</label>
                            <input type="number" min="1" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })}
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Toilets</label>
                            <input type="number" min="1" value={form.toilets} onChange={e => setForm({ ...form, toilets: e.target.value })}
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                    </>
                )}

                {/* Area Size */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Area Size (SQM)</label>
                    <div className="relative">
                        <input type="number" min="1" value={form.area_size} onChange={e => setForm({ ...form, area_size: e.target.value })}
                            placeholder="e.g. 50"
                            className="w-full p-4 pr-16 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-neutral-500">SQM</span>
                    </div>
                </div>

                {/* Property Toggles */}
                {category !== 'Land' ? (
                    <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={form.is_furnished} onChange={e => setForm({ ...form, is_furnished: e.target.checked })}
                                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-white/10 text-[#BEF264] focus:ring-[#BEF264] transition-all bg-transparent" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Furnished</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={form.is_serviced} onChange={e => setForm({ ...form, is_serviced: e.target.checked })}
                                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-white/10 text-[#BEF264] focus:ring-[#BEF264] transition-all bg-transparent" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Serviced</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={form.is_newly_built} onChange={e => setForm({ ...form, is_newly_built: e.target.checked })}
                                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-white/10 text-[#BEF264] focus:ring-[#BEF264] transition-all bg-transparent" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Newly Built</span>
                        </label>
                    </div>
                ) : (
                    <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={form.features.includes('Fenced')} onChange={e => toggleFeature('Fenced')}
                                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-white/10 text-[#BEF264] focus:ring-[#BEF264] transition-all bg-transparent" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Fenced</span>
                        </label>
                    </div>
                )}


                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder={`Describe the property in detail — condition, unique features, nearby landmarks...`}
                        rows={3}
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-medium text-gray-900 dark:text-white transition-all resize-none" />
                </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Property Photos</label>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => e.target.files && handleImageUpload(e.target.files)}
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-[#BEF264] hover:bg-[#BEF264]/5 transition-all group"
                >
                    {uploadingImages ? (
                        <Loader2 className="w-8 h-8 text-[#BEF264] animate-spin mx-auto" />
                    ) : (
                        <>
                            <UploadCloud className="w-8 h-8 text-gray-300 dark:text-neutral-600 group-hover:text-[#BEF264] mx-auto mb-2 transition-colors" />
                            <p className="text-sm font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Click to upload photos</p>
                            <p className="text-xs text-gray-400 dark:text-neutral-600 mt-1">JPG, PNG, WEBP — multiple allowed</p>
                        </>
                    )}
                </div>

                {/* Image previews */}
                {uploadedImageUrls.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {uploadedImageUrls.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group">
                                <img src={url} alt={`upload-${i}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(url)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {uploadedImageUrls.length === 0 && (
                    <p className="text-[10px] text-gray-400 dark:text-neutral-600 font-bold uppercase tracking-widest text-center">
                        <ImageIcon className="w-3 h-3 inline mr-1" />
                        No photos yet — a default image will be used
                    </p>
                )}
            </div>

            {/* Features & Documents */}
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">
                    {category === 'Land' ? 'Documents Available' : 'Key Features & Amenities'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { id: 'Constant Power', label: 'Constant Power', icon: Zap, excludeCategories: ['Land'] },
                        { id: 'Running Water', label: 'Running Water', icon: RefreshCcw, excludeCategories: ['Land'] },
                        { id: '24/7 Security', label: '24/7 Security', icon: ShieldCheck, excludeCategories: ['Land'] },
                        { id: 'High Speed Wifi', label: 'Wifi', icon: Building2, excludeCategories: ['Land'] },
                        { id: 'Boys Quater', label: 'Boys Quater', icon: Home, excludeCategories: ['Hostel', 'Shop', 'Land', 'Hotel'] },
                        { id: 'Swimming Pool', label: 'Swimming Pool', icon: Zap, excludeCategories: ['Shop', 'Land', 'Hostel'] },
                        { id: 'Elevator', label: 'Elevator', icon: Building2, excludeCategories: ['Hostel', 'Land'] },
                        { id: 'CCTV Cameras', label: 'CCTV Cameras', icon: ShieldCheck, excludeCategories: ['Land'] },
                        { id: 'Parking Space', label: 'Parking Space', icon: Home, excludeCategories: ['Land'] },
                        { id: 'Gym', label: 'Gym', icon: Zap, excludeCategories: ['Shop', 'Land', 'Hostel'] },
                        { id: 'Supermarket Nearby', label: 'Supermarket Nearby', icon: Store, excludeCategories: ['Land'] },
                        { id: 'All Room Ensuit', label: 'All Room Ensuit', icon: Home, excludeCategories: ['Shop', 'Land'], excludeSubCats: ['Single Room', 'Hostel Pod'] },
                        // Land Documents
                        { id: 'Survey Plan', label: 'Survey Plan', icon: ShieldCheck, includeCategories: ['Land'] },
                        { id: 'Deed of Assignment', label: 'Deed of Assgn.', icon: ShieldCheck, includeCategories: ['Land'] },
                        { id: 'C of O', label: 'C of O', icon: ShieldCheck, includeCategories: ['Land', 'House', 'Hotel'] },
                        { id: 'Gazette', label: 'Gazette', icon: ShieldCheck, includeCategories: ['Land'] },
                    ]
                        .filter(feat => {
                            if (feat.includeCategories && !feat.includeCategories.includes(category)) return false;
                            if (feat.excludeCategories && feat.excludeCategories.includes(category)) return false;
                            if (feat.excludeSubCats && feat.excludeSubCats.includes(subCat)) return false;
                            return true;
                        })
                        .map((feat) => {
                            const isSelected = form.features.includes(feat.id);
                            return (
                                <button key={feat.id} onClick={() => toggleFeature(feat.id)}
                                    className={`p-4 border-2 rounded-2xl flex items-center gap-3 transition-all ${isSelected ? 'border-[#BEF264] bg-[#BEF264]/10' : 'border-gray-100 dark:border-white/5 hover:border-[#BEF264]/50'}`}>
                                    <feat.icon className={`w-4 h-4 ${isSelected ? 'text-black dark:text-[#BEF264]' : 'text-gray-400 dark:text-neutral-600'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${isSelected ? 'text-black dark:text-white' : 'text-gray-600 dark:text-neutral-500'}`}>{feat.label}</span>
                                </button>
                            );
                        })}
                </div>
            </div>


            {/* Video & Virtual Tour URLs */}
            {category !== 'Land' && (
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Media Links & Video</label>
                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-white/10 relative">
                            <input type="file" accept="video/mp4,video/quicktime" onChange={(e) => { if(e.target.files?.[0]) handleVideoUpload(e.target.files[0]) }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
                                {uploadingVideo ? (
                                    <div className="flex items-center gap-2 text-[#BEF264]">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Uploading...</span>
                                    </div>
                                ) : form.video_url ? (
                                    <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Video Uploaded
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-gray-400" />
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            Upload Raw Video Walkthrough (Max 25MB)
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <input type="text" value={form.youtube_video_url} onChange={e => setForm({ ...form, youtube_video_url: e.target.value })}
                            placeholder="Link to your YouTube video"
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-medium text-gray-900 dark:text-white transition-all" />
                        
                        <input type="text" value={form.instagram_video_url} onChange={e => setForm({ ...form, instagram_video_url: e.target.value })}
                            placeholder="Link to your Instagram video"
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-medium text-gray-900 dark:text-white transition-all" />

                        <div className="relative">
                            <input type="text" value={form.virtual_tour_url} onChange={e => setForm({ ...form, virtual_tour_url: e.target.value })}
                                placeholder="Link to a 3D rendering / Virtual Tour"
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-medium text-gray-900 dark:text-white transition-all" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest bg-red-500 text-white px-2 py-1 rounded-full pointer-events-none">New!</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Local Intelligence / Land Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {category !== 'Land' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Light Score (1-10)</label>
                        <input type="number" min="1" max="10" value={form.light_score} onChange={e => setForm({ ...form, light_score: Number(e.target.value) })}
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">
                        {category === 'Land' ? 'Land Type' : 'Water Source'}
                    </label>
                    {category === 'Land' ? (
                        <select value={form.water_source} onChange={e => setForm({ ...form, water_source: e.target.value })}
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white appearance-none cursor-pointer">
                            <option>Dry Land</option>
                            <option>Swampy</option>
                            <option>Level</option>
                            <option>Sloped</option>
                        </select>
                    ) : (
                        <select value={form.water_source} onChange={e => setForm({ ...form, water_source: e.target.value })}
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white appearance-none cursor-pointer">
                            <option>Borehole</option>
                            <option>Well Water</option>
                            <option>Public Supply</option>
                            <option>Water Tanker</option>
                        </select>
                    )}
                </div>
                
                {category === 'Land' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Road Access</label>
                        <select value={form.road_access} onChange={e => setForm({ ...form, road_access: e.target.value })}
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white appearance-none cursor-pointer">
                            <option>Tarred</option>
                            <option>Graded</option>
                            <option>Unimproved</option>
                        </select>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">
                        {category === 'Land' ? 'Proximity to Landmark' : 'Distance to Gate'}
                    </label>
                    <input type="text" value={form.gate_distance} onChange={e => setForm({ ...form, gate_distance: e.target.value })}
                        placeholder={category === 'Land' ? "e.g. 5 mins from LAUTECH Main Gate" : "e.g. ~5 mins walk"}
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Location Zone</label>
                <LocationCombobox
                    value={form.location}
                    onChange={(loc) => setForm({ ...form, location: loc })}
                />
            </div>

            <button onClick={submitListing} disabled={loading || uploadingImages}
                className="w-full flex items-center justify-center gap-2 bg-[#BEF264] text-black font-black py-6 rounded-[1.8rem] uppercase tracking-widest text-sm shadow-xl shadow-[#BEF264]/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editId ? '💾 Save Changes' : '🚀 Publish Listing Now'}
            </button>
        </div>
    );

    // ─── STEP 4: Success ──────────────────────────────────────────────────────
    return (
        <div className="text-center py-20 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-[#BEF264]/10 text-[#BEF264] rounded-[2.5rem] flex items-center justify-center mx-auto rotate-3 shadow-xl border border-[#BEF264]/20">
                <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="mt-8 text-black p-10 rounded-[2.5rem] border border-gray-100 shadow-sm bg-white">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Listing Live! 🎉</h3>
                <p className="text-gray-500 font-medium tracking-wide mt-2">Your {category} listing is now visible to all users on HOSTELPULSE.</p>
                {uploadedImageUrls.length > 0 && (
                    <p className="text-xs text-[#BEF264] font-black uppercase tracking-widest mt-3">✓ {uploadedImageUrls.length} photo{uploadedImageUrls.length > 1 ? 's' : ''} uploaded</p>
                )}
            </div>
            <button onClick={() => { setStep(1); setUploadedImageUrls([]); setForm({ title: '', price: '', description: '', location: 'Under-G Area', bedrooms: '1', bathrooms: '1', toilets: '1', area_size: '', is_furnished: false, is_serviced: false, is_newly_built: false,
          video_url: '', youtube_video_url: '', instagram_video_url: '', virtual_tour_url: '', features: [], light_score: 7, water_source: 'Borehole', gate_distance: '~15 mins walk', listing_type: 'rent', road_access: 'Tarred' }); onComplete(); }}
                className="mt-8 text-black font-black uppercase tracking-widest text-[10px] underline underline-offset-8">
                Add Another Listing
            </button>
        </div>
    );
}
