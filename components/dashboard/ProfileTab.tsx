'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Phone, MessageSquare, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileTabProps {
    userId: string;
}

export default function ProfileTab({ userId }: ProfileTabProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        whatsapp_number: '',
        avatar_url: '',
    });

    useEffect(() => {
        async function loadProfile() {
            const { data, error } = await supabase
                .from('agent_accounts')
                .select('full_name, phone, whatsapp_number, avatar_url')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    whatsapp_number: data.whatsapp_number || '',
                    avatar_url: data.avatar_url || '',
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, [userId, supabase]);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('agent_accounts')
            .update({
                full_name: profile.full_name,
                phone: profile.phone,
                whatsapp_number: profile.whatsapp_number,
                avatar_url: profile.avatar_url,
            })
            .eq('id', userId);

        if (error) {
            toast.error('Failed to update profile');
        } else {
            toast.success('Profile updated successfully!');
        }
        setSaving(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('public_assets')
            .upload(`avatars/${filePath}`, file);

        if (uploadError) {
            toast.error('Failed to upload avatar');
            setSaving(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('public_assets')
            .getPublicUrl(`avatars/${filePath}`);

        setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
        setSaving(false);
        toast.success('Avatar uploaded! Don\'t forget to save changes.');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-[#BEF264] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Avatar Section */}
                <div className="md:col-span-1">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-center sticky top-24">
                        <div className="relative w-32 h-32 mx-auto mb-6 group">
                            <div className="w-full h-full rounded-full border-4 border-[#BEF264]/20 overflow-hidden bg-neutral-800">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-full h-full p-8 text-gray-600" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#BEF264] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg">
                                <Camera className="w-5 h-5 text-black" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                        <h3 className="text-white font-black uppercase tracking-tight truncate">{profile.full_name || 'Agent'}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Verified Field Agent</p>
                    </div>
                </div>

                {/* Right: Form Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-[#BEF264]" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight font-outfit">Identity & Contact</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.full_name}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264] transition-all outline-none font-medium"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Phone (Call)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264] transition-all outline-none font-medium"
                                            placeholder="e.g. 234..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">WhatsApp Number</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={profile.whatsapp_number}
                                            onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264] transition-all outline-none font-medium"
                                            placeholder="e.g. 234..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-[#BEF264] text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-[#a6d456] transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Profile'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 flex gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-emerald-400 font-black uppercase tracking-tight text-sm">Trust & Verification</h4>
                            <p className="text-emerald-400/70 text-xs mt-1 font-medium italic">
                                Your contact info is only shared with verified students when they request inspections or initiate escrow payments.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { ShieldCheck } from 'lucide-react';
