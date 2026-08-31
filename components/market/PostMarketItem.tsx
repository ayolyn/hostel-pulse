'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShoppingCart, Tag, Camera, MapPin, X, CheckCircle, Smartphone, Home, Tv, MoreHorizontal, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { CAMPUS_ZONES } from '@/lib/constants';

interface PostMarketItemProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export function PostMarketItem({ onClose, onSuccess }: PostMarketItemProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Electronics',
        price: '',
        condition: 'Slightly Used',
        location: CAMPUS_ZONES[0],
        custom_location: '',
        description: '',
        quantity: 1
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [activeCount, setActiveCount] = useState(0);
    const [checkingLimits, setCheckingLimits] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const checkLimits = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { count } = await supabase.from('market_listings').select('*', { count: 'exact', head: true }).eq('seller_id', user.id).eq('status', 'active');
            
            setActiveCount(count || 0);
            setCheckingLimits(false);
        };
        checkLimits();
    }, [supabase]);

    const categories = [
        { name: 'Electronics', icon: Tv },
        { name: 'Furniture', icon: Home },
        { name: 'Textbooks', icon: ShoppingCart },
        { name: 'Fashion', icon: Tag },
        { name: 'Services', icon: ShieldCheck },
        { name: 'Other', icon: MoreHorizontal }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let image_url: any = null;
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('market-images')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error('Storage Error:', uploadError);
                toast.error(uploadError.message || 'Image upload failed.');
                setLoading(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage
                .from('market-images')
                .getPublicUrl(fileName);
            image_url = publicUrl;
        }

        const { error } = await supabase
            .from('market_listings')
            .insert({
                seller_id: user.id,
                title: formData.title,
                category: formData.category,
                price: parseFloat(formData.price),
                description: `Condition: ${formData.condition} | Pickup: ${formData.location === 'Other' ? formData.custom_location : formData.location}`,
                image_url: image_url,
                is_featured: false,
                status: 'active',
                quantity: formData.quantity
            });

        setLoading(false);
        if (!error) {
            setStep(3); // Show Success
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 2000);
        } else {
            console.error('DB Insert Error:', error);
            toast.error(error.message || error.details || 'Failed to post item.');
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-white/5 w-full max-w-xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Sell Something</h2>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Step {step} of 3 • Marketplace Posting</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
                {checkingLimits ? (
                    <div className="py-20 text-center animate-pulse">
                        <div className="w-12 h-12 border-2 border-[#BEF264] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Checking limits...</p>
                    </div>
                ) : activeCount >= 3 ? (
                    <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Limit Reached</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-6">
                            You have reached the maximum number of active listings. Please mark an item as sold before posting a new one.
                        </p>
                        <button onClick={onClose} className="bg-black dark:bg-white text-white dark:text-black w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl">
                            Close
                        </button>
                    </div>
                ) : step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => {
                                        setFormData({...formData, category: cat.name});
                                        setStep(2);
                                    }}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 group
                                        ${formData.category === cat.name 
                                            ? 'border-[#BEF264] bg-[#BEF264]/5' 
                                            : 'border-neutral-50 dark:border-white/5 hover:border-[#BEF264]/30'
                                        }
                                    `}
                                >
                                    <cat.icon className={`w-8 h-8 ${formData.category === cat.name ? 'text-[#BEF264]' : 'text-gray-300 group-hover:text-[#BEF264]'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-tight text-center">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">What are you selling?</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Haier Thermocool Fridge"
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Price (₦)</label>
                                    <input 
                                        type="number" 
                                        required
                                        placeholder="0.00"
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Quantity Available</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Condition</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm appearance-none"
                                        value={formData.condition}
                                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                                    >
                                        <option>New</option>
                                        <option>Slightly Used</option>
                                        <option>Used</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Pickup Location</label>
                                <select 
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm appearance-none"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                >
                                    {CAMPUS_ZONES.map(z => <option key={z}>{z}</option>)}
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="mt-4 p-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl flex flex-col items-center bg-gray-50/50 dark:bg-neutral-800/50">
                                {imagePreview ? (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
                                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                                        <button 
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/70 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <Camera className="text-gray-400 mb-2 w-8 h-8" />
                                )}
                                <div className="w-full relative flex justify-center">
                                    <input 
                                        type="file" 
                                        id="market-image-upload"
                                        accept="image/*" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <label htmlFor="market-image-upload" className="py-2 px-6 rounded-full text-[10px] font-black uppercase bg-[#BEF264] text-black hover:bg-[#a6d456] cursor-pointer transition-colors z-10 pointer-events-none">
                                        Choose File
                                    </label>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Add clear photo of your item</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="flex-[2] bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Posting...' : 'Post Item for Sale'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="py-20 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-[#BEF264]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Item Posted!</h3>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Your listing is now live in the market.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
