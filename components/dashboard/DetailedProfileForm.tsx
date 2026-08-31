"use client";

import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Trash2, Link as LinkIcon, Building2, CreditCard, GraduationCap, Phone, ShieldCheck, Lock, Scale, ChevronRight, Loader2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TermsModal } from '@/components/modals/TermsModal';

interface ProfileFormProps {
    account: any;
    userId: string;
    onUpdate?: () => void;
}

export function DetailedProfileForm({ account, userId, onUpdate }: ProfileFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [activeSubTab, setActiveSubTab] = useState('Edit Profile');
    const [userRole, setUserRole] = useState<'student' | 'landlord' | 'agent' | null>(null);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRoleAndTerms() {
            const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
            if (roleData?.role) setUserRole(roleData.role as any);

            const { data: profileData } = await supabase.from('profiles').select('terms_accepted_at').eq('id', userId).single();
            if (profileData?.terms_accepted_at) setTermsAcceptedAt(profileData.terms_accepted_at);
        }
        fetchRoleAndTerms();
    }, [userId, supabase]);

    const [formData, setFormData] = useState({
        contact_name: account?.full_name || account?.contact_name || '',
        avatar_url: account?.avatar_url || account?.logo_url || '',
        university: account?.university || 'LAUTECH',
        department: account?.department || '',
        level: account?.level || '',
        whatsapp_number: account?.whatsapp_number || '',
        phone_number: account?.phone || account?.phone_number || '',
        student_id_url: account?.student_id_url || '',
        business_name: account?.business_name || '',
        logo_url: account?.logo_url || account?.avatar_url || '',
        country_code: account?.country_code || 'Nigeria(234)',
        contact_email: account?.contact_email || account?.email || '',
        office_state: account?.office_state || '',
        office_lga: account?.office_lga || '',
        office_address: account?.office_address || '',
        about_organization: account?.about_organization || '',
        services_provided: account?.services_provided || '',
        business_state: account?.business_state || '',
        business_axis: account?.business_axis || '',
        business_category: account?.business_category || '',
        facebook_url: account?.facebook_url || '',
        twitter_url: account?.twitter_url || '',
        linkedin_url: account?.linkedin_url || '',
        instagram_url: account?.instagram_url || '',
        govt_id_url: account?.govt_id_url || '',
        selfie_url: account?.selfie_url || '',
        cac_document_url: account?.cac_document_url || '',
        bank_name: account?.bank_name || '',
        account_number: account?.account_number || '',
        account_name: account?.account_name || '',
        dob: account?.dob || ''
    });

    // Keep formData in sync if account prop updates
    useEffect(() => {
        if (account) {
            setFormData(prev => ({
                ...prev,
                contact_name: account.full_name || account.contact_name || prev.contact_name,
                avatar_url: account.avatar_url || account.logo_url || prev.avatar_url,
                logo_url: account.logo_url || account.avatar_url || prev.logo_url,
                university: account.university || prev.university,
                department: account.department || prev.department,
                level: account.level || prev.level,
                whatsapp_number: account.whatsapp_number || prev.whatsapp_number,
                phone_number: account.phone || account.phone_number || prev.phone_number,
                contact_email: account.contact_email || account.email || prev.contact_email,
                dob: account.dob || prev.dob
            }));
        }
    }, [account]);

    const [files, setFiles] = useState({
        logo: null as File | null,
        govt_id: null as File | null,
        selfie: null as File | null,
        cac: null as File | null,
        student_id: null as File | null
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'govt_id' | 'selfie' | 'cac' | 'student_id') => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const uploadFile = async (file: File, bucket: string, pathPrefix: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${pathPrefix}-${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from(bucket).upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isApproved = account?.is_approved || account?.is_verified;
        if (!termsAcceptedAt && !isApproved && (userRole === 'agent' || userRole === 'landlord')) {
            setIsTermsModalOpen(true);
            return;
        }

        setMsg({ type: '', text: '' });
        setLoading(true);

        try {
            let updates: any = { ...formData };
            if (updates.dob === '') updates.dob = null;
            
            if (files.logo) updates.logo_url = await uploadFile(files.logo, 'public_assets', 'logo');
            if (files.govt_id) updates.govt_id_url = await uploadFile(files.govt_id, 'compliance_docs', 'govt_id');
            if (files.selfie) updates.selfie_url = await uploadFile(files.selfie, 'compliance_docs', 'selfie');
            if (files.cac) updates.cac_document_url = await uploadFile(files.cac, 'compliance_docs', 'cac');
            if (files.student_id) updates.student_id_url = await uploadFile(files.student_id, 'compliance_docs', 'student_id');

            if (userRole === 'student') {
                const { error: studentError } = await supabase.from('student_accounts').update({
                    full_name: updates.contact_name,
                    university: updates.university,
                    department: updates.department,
                    level: updates.level,
                    whatsapp_number: updates.whatsapp_number,
                    phone: updates.phone_number,
                    student_id_url: updates.student_id_url || formData.student_id_url,
                    avatar_url: updates.logo_url || formData.logo_url,
                    bank_name: updates.bank_name,
                    account_number: updates.account_number,
                    account_name: updates.account_name,
                    dob: updates.dob,
                    contact_email: updates.contact_email
                }).eq('id', userId);
                if (studentError) throw studentError;
                
                await supabase.from('profiles').update({ 
                    full_name: updates.contact_name, 
                    avatar_url: updates.logo_url || formData.logo_url,
                    department: updates.department, 
                    level: updates.level, 
                    student_id_url: updates.student_id_url || formData.student_id_url,
                    dob: updates.dob,
                    contact_email: updates.contact_email
                }).eq('id', userId);
            } else if (userRole === 'agent') {
                const complianceSubmitted = !!(updates.govt_id_url && updates.selfie_url);
                const { error: agentError } = await supabase.from('agent_accounts').update({
                    full_name: updates.contact_name,
                    phone: updates.phone_number,
                    whatsapp_number: updates.whatsapp_number,
                    avatar_url: updates.logo_url || formData.logo_url,
                    dob: updates.dob,
                    contact_email: updates.contact_email,
                    govt_id_url: updates.govt_id_url,
                    selfie_url: updates.selfie_url,
                    cac_document_url: updates.cac_document_url,
                    business_name: updates.business_name,
                    office_address: updates.office_address,
                    compliance_submitted: complianceSubmitted
                }).eq('id', userId);
                if (agentError) {
                    console.error("Agent Update Error:", agentError);
                    throw agentError;
                }

                await supabase.from('profiles').update({ 
                    full_name: updates.contact_name,
                    avatar_url: updates.logo_url || formData.logo_url,
                    dob: updates.dob,
                    contact_email: updates.contact_email
                }).eq('id', userId);
            } else {
                const complianceSubmitted = !!(updates.govt_id_url && updates.selfie_url);
                const { error } = await supabase.from('landlord_accounts').update({ 
                    full_name: updates.contact_name, 
                    avatar_url: updates.logo_url || formData.logo_url,
                    logo_url: updates.logo_url || formData.logo_url,
                    compliance_submitted: complianceSubmitted,
                    dob: updates.dob,
                    contact_email: updates.contact_email,
                    business_name: updates.business_name,
                    office_address: updates.office_address,
                    phone_number: updates.phone_number,
                    whatsapp_number: updates.whatsapp_number,
                    govt_id_url: updates.govt_id_url,
                    selfie_url: updates.selfie_url,
                    cac_document_url: updates.cac_document_url
                }).eq('id', userId);
                if (error) {
                    console.error("Landlord Update Error:", error);
                    throw error;
                }

                await supabase.from('profiles').update({ 
                    full_name: updates.contact_name,
                    avatar_url: updates.logo_url || formData.logo_url,
                    dob: updates.dob,
                    contact_email: updates.contact_email
                }).eq('id', userId);
            }

            setMsg({ type: 'success', text: 'Profile updated successfully!' });
            if (onUpdate) onUpdate();
            setTimeout(() => { router.refresh(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 2000);
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || 'Error updating profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptTerms = async () => {
        try {
            const now = new Date().toISOString();
            const { error } = await supabase.from('profiles').update({ terms_accepted_at: now }).eq('id', userId);
            if (error) throw error;
            setTermsAcceptedAt(now);
            setIsTermsModalOpen(false);
            setMsg({ type: 'success', text: 'Terms accepted! You can now save your profile.' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to save terms acceptance.' });
        }
    };

    const renderMyProfile = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-neutral-900 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 shadow-inner group relative">
                    {(formData.avatar_url || formData.logo_url) ? (
                        <Image src={formData.avatar_url || formData.logo_url} alt="Profile" width={96} height={96} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                    ) : (
                        <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.contact_name || 'User')}&backgroundColor=e5e5e5`} alt="Profile Fallback" width={96} height={96} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{formData.contact_name || 'Your Name'}</h3>
                    <div className="flex items-center gap-1 mt-1">
                        {account?.is_approved || account?.is_verified || account?.compliance_submitted ? (
                            <CheckCircle2 className={`w-4 h-4 ${account?.is_approved || account?.is_verified ? 'text-[#BEF264]' : 'text-amber-500'}`} />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <p className={`font-black text-[10px] uppercase tracking-[0.2em] ${account?.is_approved || account?.is_verified ? 'text-blue-600 dark:text-[#BEF264]' : (account?.compliance_submitted ? 'text-amber-500' : 'text-red-500')}`}>
                            {account?.rank ? `${account.rank} Rank` : ((account?.is_approved || account?.is_verified) ? 'Verified Member' : (account?.compliance_submitted ? 'Pending Verification' : 'INCOMPLETE - ACTION REQUIRED'))}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Personnel Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-sm font-medium">
                    <div>
                        <p className="text-gray-400 dark:text-neutral-500 text-[9px] font-black uppercase tracking-widest mb-2">Contact Name</p>
                        <p className="text-gray-900 dark:text-white font-bold">{formData.contact_name || '—'}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 dark:text-neutral-500 text-[9px] font-black uppercase tracking-widest mb-2">Phone Number</p>
                        <p className="text-gray-900 dark:text-white font-bold">{formData.phone_number || '—'}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 dark:text-neutral-500 text-[9px] font-black uppercase tracking-widest mb-2">Email</p>
                        <p className="text-gray-900 dark:text-white font-bold">{formData.contact_email || account?.email || '—'}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 dark:text-neutral-500 text-[9px] font-black uppercase tracking-widest mb-2">Date of Birth</p>
                        <p className="text-gray-900 dark:text-white font-bold">{formData.dob || '—'}</p>
                    </div>
                    {userRole === 'student' && (
                        <>
                            <div>
                                <p className="text-gray-400 dark:text-neutral-500 text-[9px] font-black uppercase tracking-widest mb-2">Department / Unit</p>
                                <p className="text-gray-900 dark:text-white font-bold">{formData.department || 'Not Specified'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 dark:text-neutral-500 text-[9px] font-black uppercase tracking-widest mb-2">Level / Rank</p>
                                <p className="text-gray-900 dark:text-white font-bold">{formData.level || 'Not Specified'}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6 font-bold">Authenticated Documents</h4>
                    <div className="space-y-3">
                        {userRole === 'student' ? (
                            <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors px-4 -mx-4 rounded-xl">
                                <span className="text-sm font-black text-gray-700 dark:text-neutral-300 uppercase tracking-tight">University ID (LAUTECH)</span>
                                {formData.student_id_url || account?.is_approved || account?.is_verified ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Authenticated</span>
                                        {formData.student_id_url && <a href={formData.student_id_url} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">View</a>}
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setActiveSubTab('Edit Profile')} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline text-right">
                                        Action Required<br/><span className="text-[8px] text-red-400">Click to upload</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            ['govt_id_url', 'selfie_url', 'cac_document_url'].map(key => {
                                const label = key === 'govt_id_url' ? 'Govt. Issued ID' : key === 'selfie_url' ? 'Selfie Photo' : 'Business CAC Document';
                                const url = formData[key as keyof typeof formData] as string;
                                const isMandatory = key !== 'cac_document_url';
                                return (
                                    <div key={key} className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors px-4 -mx-4 rounded-xl">
                                        <span className="text-sm font-black text-gray-700 dark:text-neutral-300 uppercase tracking-tight">{label}</span>
                                        {url || account?.is_approved || account?.is_verified ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Authenticated</span>
                                                {url && <a href={url} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">View</a>}
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => isMandatory && setActiveSubTab('Edit Profile')} className={`text-[10px] font-black uppercase tracking-widest text-right ${isMandatory ? 'text-red-500 hover:underline' : 'text-gray-400 cursor-default'}`}>
                                                {isMandatory ? <><span className="block">Missing Document</span><span className="text-[8px] text-red-400">Click to upload</span></> : 'Optional'}
                                            </button>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEditFields = () => (
        <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
            {msg.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest ${msg.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/20'}`}>
                    {msg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    {msg.text}
                </div>
            )}

            {/* Terms Block for Agents/Landlords */}
            {(userRole === 'agent' || userRole === 'landlord') && !(account?.is_approved || account?.is_verified) && (
                <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col sm:flex-row items-center gap-6 ${termsAcceptedAt ? 'bg-emerald-50 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-900/10' : 'bg-amber-50 dark:bg-amber-900/5 border-amber-100 dark:border-amber-900/10'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${termsAcceptedAt ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'}`}>
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Legal Compliance Agreement</h4>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-neutral-500 mt-1 uppercase tracking-widest leading-relaxed">
                            {termsAcceptedAt ? `Accepted on ${new Date(termsAcceptedAt).toLocaleDateString()}` : 'You must accept the professional terms of service to unlock all platform tools.'}
                        </p>
                    </div>
                    {!termsAcceptedAt && (
                        <button type="button" onClick={() => setIsTermsModalOpen(true)} className="px-8 py-4 bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
                            Accept Terms
                        </button>
                    )}
                </div>
            )}

            {/* Dynamic Content based on Role */}
            {userRole === 'student' ? (
                <>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2">Academic Identity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Full Name (Legal)</label>
                            <input 
                                name="contact_name" 
                                value={formData.contact_name} 
                                onChange={handleTextChange} 
                                disabled={account?.is_approved}
                                placeholder="Your full name" 
                                className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all disabled:opacity-50 disabled:grayscale" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Department</label>
                            <input 
                                name="department" 
                                value={formData.department} 
                                onChange={handleTextChange} 
                                disabled={account?.is_approved}
                                placeholder="e.g. Physiology Dept" 
                                className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all disabled:opacity-50 disabled:grayscale" 
                            />
                        </div>
                    </div>

                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 pt-6">Personnel Tracking</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Contact Email</label>
                            <input name="contact_email" value={formData.contact_email} onChange={handleTextChange} placeholder="Tracking Email" className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Phone Number</label>
                            <input name="phone_number" value={formData.phone_number} onChange={handleTextChange} placeholder="080..." className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleTextChange} className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2">Professional Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Business Name</label>
                            <input name="business_name" value={formData.business_name} onChange={handleTextChange} placeholder="Real Estate Firm Name" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-2">Office Address</label>
                            <input name="office_address" value={formData.office_address} onChange={handleTextChange} placeholder="Full address in Ogbomoso" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                    </div>

                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 pt-6">Brand Identity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-neutral-900/50 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:border-[#BEF264]/50 transition-all group overflow-hidden h-40 flex flex-col items-center justify-center">
                            <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center z-20">
                                <input type="file" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="hidden" />
                                {!(formData.logo_url || formData.avatar_url || files.logo) && (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-black shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-[#BEF264] transition-colors" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Profile Avatar / Logo</p>
                                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Click to upload picture</p>
                                    </>
                                )}
                            </label>
                            
                            {(formData.logo_url || formData.avatar_url || files.logo) && (
                                <div className="absolute inset-0 z-10">
                                    <img 
                                        src={files.logo ? URL.createObjectURL(files.logo) : (formData.logo_url || formData.avatar_url)} 
                                        alt="Logo Preview" 
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end pb-4">
                                        <CheckCircle2 className="w-8 h-8 text-[#BEF264] mb-1 drop-shadow-md" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Avatar Uploaded</p>
                                        <p className="text-[8px] font-bold text-gray-300 uppercase mt-0.5">Click anywhere to change</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 pt-6">Identity Verification</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { id: 'govt_id', label: 'Government ID', accept: 'image/*,.pdf' },
                            { id: 'selfie', label: 'Identity Selfie', accept: 'image/*' },
                            { id: 'cac', label: 'CAC Document', accept: 'image/*,.pdf' }
                        ].map(doc => {
                            const fileObj = files[doc.id as keyof typeof files];
                            const fileUrl = formData[`${doc.id}_url` as keyof typeof formData];
                            const hasFile = !!(fileObj || fileUrl);
                            const isLocked = hasFile && (account?.is_approved || account?.is_verified || account?.compliance_submitted);
                            const previewUrl = fileObj && fileObj.type.startsWith('image/') 
                                ? URL.createObjectURL(fileObj as File) 
                                : (fileUrl && typeof fileUrl === 'string' && !fileUrl.endsWith('.pdf') ? fileUrl : null);

                            return (
                                <div key={doc.id} className={`relative border-2 ${isLocked ? 'border-[#BEF264] bg-[#BEF264]/10 border-solid' : 'border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-neutral-900/50 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:border-[#BEF264]/50 cursor-pointer'} rounded-3xl transition-all group overflow-hidden h-40 flex flex-col items-center justify-center`}>
                                    <label className={`absolute inset-0 flex flex-col items-center justify-center z-20 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                        <input type="file" disabled={isLocked} onChange={(e) => handleFileChange(e, doc.id as any)} accept={doc.accept} className="hidden" />
                                        {!hasFile && (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-white dark:bg-black shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-[#BEF264] transition-colors" />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">{doc.label}</p>
                                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Click to upload</p>
                                            </>
                                        )}
                                    </label>
                                    
                                    {hasFile && !isLocked && (
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 dark:bg-neutral-800">
                                            {previewUrl ? (
                                                <img 
                                                    src={previewUrl} 
                                                    alt={`${doc.label} Preview`} 
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-60 group-hover:opacity-40 transition-opacity bg-neutral-200 dark:bg-neutral-800">
                                                    <ShieldCheck className="w-16 h-16 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end pb-4">
                                                <CheckCircle2 className="w-8 h-8 text-[#BEF264] mb-1 drop-shadow-md" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">{doc.label}</p>
                                                <p className="text-[8px] font-bold text-gray-300 uppercase mt-0.5">Click to update</p>
                                            </div>
                                        </div>
                                    )}

                                    {isLocked && (
                                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#BEF264]/10 backdrop-blur-sm">
                                            <div className="w-14 h-14 bg-[#BEF264] rounded-full flex items-center justify-center mb-2 shadow-lg shadow-[#BEF264]/30">
                                                <CheckCircle2 className="w-7 h-7 text-black" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-widest text-[#BEF264] drop-shadow-md">Verified Document</p>
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-neutral-500 mt-1 uppercase">{doc.label}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 pt-6">Personnel Tracking</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Contact Email</label>
                            <input name="contact_email" value={formData.contact_email} onChange={handleTextChange} placeholder="Tracking Email" className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Phone Number</label>
                            <input name="phone_number" value={formData.phone_number} onChange={handleTextChange} placeholder="080..." className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 px-3">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleTextChange} className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-neutral-900 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all" />
                        </div>
                    </div>
                </>
            )}

            {/* Legal Governance Block */}
            {!termsAcceptedAt && !(account?.is_approved || account?.is_verified) && (
                <div className="mt-12 p-10 bg-black dark:bg-[#BEF264]/5 border-2 border-[#BEF264]/30 rounded-[3rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-24 h-24 text-[#BEF264]" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BEF264] mb-4 flex items-center gap-2">
                             <Lock className="w-3 h-3" /> Mandatory Legal Guard
                        </p>
                        <h4 className="text-2xl font-black text-white dark:text-neutral-900 uppercase tracking-tighter leading-tight mb-4 max-w-sm">
                            Accept the Professional Terms of Service
                        </h4>
                        <p className="text-sm font-medium text-gray-400 dark:text-neutral-600 mb-8 max-w-md italic">
                            "In Ogbomoso, we operate with integrity. You must enter a digital contract with HOSTELPULSE regarding escrow safety and document privacy before you can proceed."
                        </p>
                        <button 
                            type="button"
                            onClick={() => setIsTermsModalOpen(true)}
                            className="px-10 py-5 bg-[#BEF264] text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#BEF264]/20 flex items-center gap-3"
                        >
                            <Scale className="w-4 h-4" />
                            Review & Accept Terms
                        </button>
                    </div>
                </div>
            )}
            
            {/* Submit Block */}
            <div className="pt-10 border-t border-gray-100 dark:border-white/5">
                <button 
                    disabled={loading || (!termsAcceptedAt && !(account?.is_approved || account?.is_verified))} 
                    type="submit" 
                    className="w-full sm:w-auto px-12 py-5 bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black rounded-3xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-4 group shadow-xl shadow-black/10"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🚀 Update Official Profile'}
                    {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
                {termsAcceptedAt && (
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-[#BEF264] uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4" />
                        Professional Terms Accepted on {new Date(termsAcceptedAt).toLocaleDateString()}
                    </div>
                )}
            </div>
        </form>
    );

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Profile HQ</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your identity & compliance</p>
                </div>
            </div>
            
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-neutral-900 rounded-2xl w-fit border border-gray-200 dark:border-white/5 shadow-inner">
                {['My Profile', 'Edit Profile'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-white dark:bg-black text-gray-900 dark:text-[#BEF264] shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-neutral-950/40 p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                {activeSubTab === 'My Profile' ? renderMyProfile() : renderEditFields()}
            </div>

            <TermsModal 
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
                onAccept={handleAcceptTerms}
                userType={userRole || 'student'}
            />
        </div>
    );
}
