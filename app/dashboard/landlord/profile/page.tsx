"use client";
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Save, MapPin, AlignLeft, Briefcase, Building2, Phone, User as UserIcon } from 'lucide-react';

export default function LandlordProfilePage() {
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile Fields
    const [fullName, setFullName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [officeAddress, setOfficeAddress] = useState('');
    const [aboutOrganization, setAboutOrganization] = useState('');
    const [servicesProvided, setServicesProvided] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data, error } = await supabase
                    .from('landlord_accounts')
                    .select('full_name, business_name, whatsapp_number, office_address, about_organization, services_provided, logo_url')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setFullName(data.full_name || '');
                    setBusinessName(data.business_name || '');
                    setWhatsappNumber(data.whatsapp_number || '');
                    setOfficeAddress(data.office_address || '');
                    setAboutOrganization(data.about_organization || '');
                    setServicesProvided(data.services_provided || '');
                    setLogoUrl(data.logo_url || '');
                }
            }
            setLoading(false);
        }
        fetchProfile();
    }, [supabase]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        try {
            setMessage({ type: 'info', text: 'Uploading logo...' });
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${userId}-${Math.random()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('compliance_docs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('compliance_docs')
                .getPublicUrl(filePath);

            setLogoUrl(data.publicUrl);
            
            // Auto save the logo URL to DB
            await supabase.from('landlord_accounts').update({ logo_url: data.publicUrl }).eq('id', userId);
            
            setMessage({ type: 'success', text: 'Logo updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to upload logo: ' + error.message });
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase
                .from('landlord_accounts')
                .update({
                    full_name: fullName,
                    business_name: businessName,
                    whatsapp_number: whatsappNumber,
                    office_address: officeAddress,
                    about_organization: aboutOrganization,
                    services_provided: servicesProvided
                })
                .eq('id', userId);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to update profile: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-5 animate-pulse flex space-x-4">
            <div className="rounded-full bg-neutral-200 dark:bg-neutral-800 h-20 w-20"></div>
            <div className="flex-1 space-y-6 py-1">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
                </div>
            </div>
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-neutral-900 dark:text-white">Business Profile</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your public organization details and branding.</p>
            </div>

            {message.text && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-semibold border flex items-center gap-3 ${
                    message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' :
                    message.type === 'success' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' :
                    'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
                
                {/* Logo Section */}
                <div className="p-6 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-800 shadow-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-10 h-10 text-neutral-400" />
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Camera className="w-6 h-6" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Company Logo</h3>
                        <p className="text-sm text-neutral-500">Recommended size: 400x400px. Forms your public identity.</p>
                    </div>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSaveProfile} className="p-6 sm:p-6 space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Contact Name *</label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Business Name *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="text"
                                    required
                                    value={businessName}
                                    onChange={e => setBusinessName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">WhatsApp Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="tel"
                                    required
                                    value={whatsappNumber}
                                    onChange={e => setWhatsappNumber(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Office Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="text"
                                    value={officeAddress}
                                    onChange={e => setOfficeAddress(e.target.value)}
                                    placeholder="e.g. 123 University Road, Ogbomoso"
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4 text-neutral-400" />
                            About Organization
                        </label>
                        <textarea
                            rows={4}
                            value={aboutOrganization}
                            onChange={e => setAboutOrganization(e.target.value)}
                            placeholder="Describe your organization, history, and values..."
                            className="w-full p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-neutral-400" />
                            Services Provided
                        </label>
                        <textarea
                            rows={3}
                            value={servicesProvided}
                            onChange={e => setServicesProvided(e.target.value)}
                            placeholder="e.g. Facility Management, Property Sales, Shortlets..."
                            className="w-full p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all resize-none"
                        />
                    </div>

                    <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-[#BEF264] text-black px-8 py-3 rounded-full font-black uppercase tracking-wider hover:bg-[#a6d456] transition-transform active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
