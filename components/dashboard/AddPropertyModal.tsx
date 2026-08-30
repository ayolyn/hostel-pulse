"use client";

import React, { useState, useRef } from 'react';
import { 
    X, 
    Video, 
    Camera, 
    MapPin, 
    ShieldCheck, 
    Zap, 
    Droplets, 
    Shield, 
    Layout,
    ChevronRight,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    Building2,
    MoreHorizontal,
    UserCog
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CAMPUS_ZONES } from '@/lib/constants';

interface AddPropertyModalProps {
    userId: string;
    userRole: 'agent' | 'landlord';
    onClose: () => void;
    onSuccess: () => void;
}


const CATEGORIES = ['Hostel', 'Shop', 'House', 'Hotel'];
const AMENITIES = [
    { id: 'water', label: 'Running Water', icon: Droplets },
    { id: 'light', label: 'Standard Light', icon: Zap },
    { id: 'security', label: '24/7 Security', icon: Shield },
    { id: 'wardrobe', label: 'Wardrobe', icon: Layout }
];

export default function AddPropertyModal({ userId, userRole, onClose, onSuccess }: AddPropertyModalProps) {
    const supabase = createClient();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCheckingTerms, setIsCheckingTerms] = useState(true);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

    React.useEffect(() => {
        async function checkTerms() {
            const { data } = await supabase.from('profiles').select('terms_accepted_at').eq('id', userId).single();
            if (data?.terms_accepted_at) {
                setHasAcceptedTerms(true);
            }
            setIsCheckingTerms(false);
        }
        checkTerms();
    }, [userId, supabase]);

    const [form, setForm] = useState({
        title: '',
        price: '',
        category: 'Hostel',
        zone: CAMPUS_ZONES[0],
        description: '',
        amenities: [] as string[]
    });

    const [media, setMedia] = useState({
        video: null as File | null,
        images: [] as File[]
    });

    const videoInputRef = useRef<HTMLInputElement>(null);
    const imagesInputRef = useRef<HTMLInputElement>(null);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const toggleAmenity = (id: string) => {
        setForm(prev => ({
            ...prev,
            amenities: prev.amenities.includes(id) 
                ? prev.amenities.filter(a => a !== id) 
                : [...prev.amenities, id]
        }));
    };

    const uploadFile = async (file: File, bucket: string, folder: string) => {
        const ext = file.name.split('.').pop();
        const path = `${folder}/${userId}-${Date.now()}.${ext}`;
        const { data, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    };

    const getListingType = (cat: string) => {
        if (cat === 'House') return 'sale';
        if (cat === 'Hotel') return 'shortlet';
        if (cat === 'Shop') return 'shop';
        return 'rent'; // Hostel
    };

    const handleSubmit = async () => {
        if (!media.video) { setStep(2); setError("Video tour is mandatory for verification."); return; }
        setLoading(true);
        setError('');

        try {
            // 1. Upload Media
            const videoUrl = await uploadFile(media.video, 'property-images', 'videos');
            const imageUrls = await Promise.all(
                media.images.map(img => uploadFile(img, 'property-images', 'photos'))
            );

            // 2. Save Property
            const propertyData = {
                owner_id: userId,
                title: form.title,
                price: Number(form.price),
                category: form.category,
                listing_type: getListingType(form.category),
                zone: form.zone,
                location: `${form.zone} Area, Ogbomoso`,
                description: form.description,
                features: form.amenities,
                video_url: videoUrl,
                images: imageUrls,
                verification_status: 'Verified',
                status: 'active',
                price_label: 'per year',
                state: 'Oyo',
                agent_id: userRole === 'agent' ? userId : null,
                landlord_id: userRole === 'landlord' ? userId : null
            };

            const { error: dbError } = await supabase
                .from('properties')
                .insert(propertyData);

            if (dbError) throw dbError;

            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to list property. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Listing Title</label>
                <input 
                    name="title" value={form.title} onChange={handleTextChange}
                    placeholder="e.g. Executive Self-con near LAUTECH"
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold text-gray-900 dark:text-white"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Price (₦)</label>
                    <input 
                        name="price" value={form.price} onChange={handleTextChange}
                        placeholder="350000"
                        className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold text-gray-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Category</label>
                    <select 
                        name="category" value={form.category} onChange={handleTextChange}
                        className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold text-gray-900 dark:text-white appearance-none"
                    >
                        {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Mandatory 30s Video Tour</label>
                <button 
                    onClick={() => videoInputRef.current?.click()}
                    className={`w-full aspect-video border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center transition-all ${media.video ? 'border-[#BEF264] bg-[#BEF264]/5' : 'border-neutral-200 dark:border-white/5 hover:border-[#BEF264]'}`}
                >
                    {media.video ? (
                        <>
                            <div className="w-16 h-16 bg-[#BEF264] rounded-2xl flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-8 h-8 text-black" />
                            </div>
                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Video Attached ✓</p>
                            <p className="text-[10px] font-bold text-[#BEF264] mt-1">{media.video.name}</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-2xl flex items-center justify-center mb-4">
                                <Video className="w-8 h-8 text-neutral-400" />
                            </div>
                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Anti-Scam Proof</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-relaxed">Mandatory Video Tour <br/> (Max 30 seconds)</p>
                        </>
                    )}
                </button>
                <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={(e) => e.target.files && setMedia(prev => ({ ...prev, video: e.target.files![0] }))} />
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Photo Gallery (Max 4)</label>
                <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map(i => (
                        <button 
                            key={i}
                            onClick={() => imagesInputRef.current?.click()}
                            className="aspect-square bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all overflow-hidden"
                        >
                            {media.images[i] ? (
                                <img src={URL.createObjectURL(media.images[i])} className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-5 h-5 text-neutral-500" />
                            )}
                        </button>
                    ))}
                </div>
                <input type="file" ref={imagesInputRef} accept="image/*" multiple className="hidden" onChange={(e) => {
                    if (e.target.files) {
                        const newImages = Array.from(e.target.files).slice(0, 4);
                        setMedia(prev => ({ ...prev, images: newImages }));
                    }
                }} />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Ogbomoso Operating Zone</label>
                <div className="grid grid-cols-1 gap-3">
                    {CAMPUS_ZONES.map(zone => (
                        <button 
                            key={zone}
                            onClick={() => setForm(prev => ({ ...prev, zone }))}
                            className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${form.zone === zone ? 'border-[#BEF264] bg-[#BEF264]/5' : 'border-neutral-100 dark:border-white/5 hover:border-[#BEF264]/30'}`}
                        >
                            <div className="flex items-center gap-4">
                                <MapPin className={form.zone === zone ? 'text-[#BEF264]' : 'text-neutral-500'} />
                                <span className={`font-black uppercase tracking-widest text-xs ${form.zone === zone ? 'text-[#BEF264]' : 'text-gray-500'}`}>{zone}</span>
                            </div>
                            {form.zone === zone && <CheckCircle2 className="w-5 h-5 text-[#BEF264]" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 gap-4">
                {AMENITIES.map(amenity => (
                    <button 
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${form.amenities.includes(amenity.id) ? 'border-[#BEF264] bg-[#BEF264]/5 shadow-[0_0_15px_rgba(190,242,100,0.1)]' : 'border-neutral-100 dark:border-white/5'}`}
                    >
                        <amenity.icon className={`w-6 h-6 ${form.amenities.includes(amenity.id) ? 'text-[#BEF264]' : 'text-neutral-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${form.amenities.includes(amenity.id) ? 'text-white' : 'text-gray-500'}`}>{amenity.label}</span>
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Agent's Note</label>
                <textarea 
                    name="description" value={form.description} onChange={handleTextChange}
                    placeholder="Write a internal note about light frequency, water quality, or landlord vibes..."
                    rows={4}
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-gray-900 dark:text-white resize-none"
                />
            </div>
        </div>
    );

    if (isCheckingTerms) return null;

    const handleGoToProfile = () => {
        onClose();
        router.push(userRole === 'agent' ? '/dashboard/agent?tab=profile' : '/dashboard/landlord?tab=profile');
    };

    if (!hasAcceptedTerms) {
        return (
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-[3.5rem] border border-white/10 p-12 text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-500/20" />
                    <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight px-4">Legal Guard Active</h2>
                    <p className="text-[11px] font-bold text-gray-500 leading-relaxed italic mt-4 px-2">
                        "In Ogbomoso, we keep things professional. You must accept the Professional Terms of Service in your profile before you can list a property."
                    </p>
                    <div className="mt-10">
                        <button 
                            onClick={handleGoToProfile}
                            className="w-full py-6 bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3"
                        >
                            <UserCog className="w-4 h-4" />
                            Go to Profile Settings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-white dark:bg-neutral-950 rounded-[3rem] border border-white/10 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-1">Step {step} of 4</p>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            {step === 1 ? 'Property Basics' : step === 2 ? 'The Proof' : step === 3 ? 'Zone Selection' : 'Final Details'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-900">
                    <div className="h-full bg-[#BEF264] transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    {error && (
                        <div className="mb-6 bg-red-600/10 border border-red-600/20 text-red-500 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
                    <button 
                        onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        className="text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all flex items-center gap-2"
                        disabled={loading}
                    >
                        <ChevronLeft className="w-4 h-4" /> {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    
                    <button 
                        onClick={() => step < 4 ? setStep(s => s + 1) : handleSubmit()}
                        disabled={loading || (step === 1 && (!form.title || !form.price)) || (step === 2 && !media.video)}
                        className={`px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-xl
                            ${step === 4 ? 'bg-[#BEF264] text-black shadow-[#BEF264]/20' : 'bg-white dark:bg-white text-black'}
                        `}
                    >
                        {loading ? 'Publishing...' : step === 4 ? '🚀 Publish Listing' : 'Continue'}
                        {!loading && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

const AlertCircle = (props: any) => (
    <svg 
        {...props} 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
    >
        <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
);
