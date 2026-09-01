"use client";

import React, { useState } from 'react';
import { 
    ShieldCheck, 
    User, 
    Building2, 
    CreditCard, 
    FileText, 
    Upload, 
    CheckCircle2, 
    ChevronRight, 
    ChevronLeft,
    AlertCircle,
    Camera
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { sendComplianceEmail } from '@/app/actions/email';

interface CompliancePortalProps {
    accountType: 'landlord' | 'agent';
    userId: string;
}

const STEPS = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'business', title: 'Business Profile', icon: Building2 },
    { id: 'payout', title: 'Payout Details', icon: CreditCard },
    { id: 'identity', title: 'Identity Docs', icon: ShieldCheck },
];

export default function CompliancePortal({ accountType, userId }: CompliancePortalProps) {
    const router = useRouter();
    const supabase = createClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        business_name: '',
        office_address: '',
        bank_name: '',
        account_number: '',
        account_name: ''
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        govt_id: null,
        selfie: null,
        cac: null
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const uploadFile = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('compliance_docs')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('compliance_docs')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            const govtIdUrl = files.govt_id ? await uploadFile(files.govt_id, 'govt_ids') : null;
            const selfieUrl = files.selfie ? await uploadFile(files.selfie, 'selfies') : null;
            const cacUrl = files.cac ? await uploadFile(files.cac, 'cac_docs') : null;

            const table = accountType === 'landlord' ? 'landlord_accounts' : 'agent_accounts';
            
            const { data, error } = await supabase
                .from(table)
                .upsert({
                    id: userId,
                    ...formData,
                    govt_id_url: govtIdUrl,
                    selfie_url: selfieUrl,
                    cac_document_url: cacUrl,
                    compliance_submitted: true
                })
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error("Update failed. Please ensure your account exists.");
            }

            setMsg({ type: 'success', text: 'Compliance documents submitted! Redirecting to dashboard...' });
            
            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || 'Failed to submit. Please check your connection.' });
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
        else handleSubmit();
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(s => s - 1);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-950 overflow-y-auto no-scrollbar">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-white/5 px-6 py-3 flex flex-col z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-tighter dark:text-white">Seller Compliance</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">KYC Verification Gate</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${idx <= currentStep ? 'bg-[#BEF264] text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                                    {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                {idx < STEPS.length - 1 && <div className={`w-4 sm:w-8 h-0.5 mx-1 rounded-full ${idx < currentStep ? 'bg-[#BEF264]' : 'bg-neutral-100 dark:bg-neutral-800'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Verification Progress Bar */}
                <div className="mt-4 h-1 w-full bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#BEF264] transition-all duration-500 ease-out shadow-[0_0_10px_#BEF264]"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
                {msg.text && (
                    <div className={`mb-8 p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top duration-500 font-bold ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {msg.type === 'error' ? <AlertCircle className="w-6 h-6 shrink-0" /> : <CheckCircle2 className="w-6 h-6 shrink-0" />}
                        <p>{msg.text}</p>
                    </div>
                )}

                <div className="space-y-12">
                    {/* STEP 1: PERSONAL */}
                    {currentStep === 0 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Personal Identity</h2>
                                <p className="text-neutral-500 font-medium">Please provide your official contact details as registered on your ID.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Full Legal Name</label>
                                    <input name="full_name" value={formData.full_name} onChange={handleTextChange} placeholder="John Doe" className="w-full bg-neutral-100/50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">WhatsApp Number (Mandatory)</label>
                                    <input name="phone" value={formData.phone} onChange={handleTextChange} placeholder="0810 000 0000" className="w-full bg-neutral-100/50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: BUSINESS */}
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Business Profile</h2>
                                <p className="text-neutral-500 font-medium">Where do you operate from? (Physical address required for verification).</p>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Business Name (Optional)</label>
                                    <input name="business_name" value={formData.business_name} onChange={handleTextChange} placeholder="e.g. HOSTELPULSE Realty" className="w-full bg-neutral-100/50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Office Address</label>
                                    <input name="office_address" value={formData.office_address} onChange={handleTextChange} placeholder="Plot 2, Under-G Area, Ogbomoso" className="w-full bg-neutral-100/50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PAYOUT */}
                    {currentStep === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Payout Details</h2>
                                <p className="text-neutral-500 font-medium">Funds from sales and rents will be deposited here.</p>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Bank Name</label>
                                        <input name="bank_name" value={formData.bank_name} onChange={handleTextChange} placeholder="e.g. GTBank / Kuda" className="w-full bg-neutral-100/50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Account Number</label>
                                        <input name="account_number" value={formData.account_number} onChange={handleTextChange} placeholder="0123456789" className="w-full bg-neutral-100/50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Account Holder Name</label>
                                    <input name="account_name" value={formData.account_name} onChange={handleTextChange} placeholder="Ensuring it matches your ID" className="w-full bg-neutral-100/50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-bold" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: IDENTITY */}
                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Final Verification</h2>
                                <p className="text-neutral-500 font-medium">Upload physical proof of identity to protect our community from scams.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Govt ID */}
                                <label className="relative group cursor-pointer">
                                    <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center hover:border-[#BEF264] transition-all group-hover:scale-[1.02]">
                                        <div className="w-16 h-16 bg-white dark:bg-black rounded-3xl flex items-center justify-center mb-4 shadow-xl">
                                            <FileText className="w-8 h-8 text-neutral-400" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Government ID</p>
                                        <p className="text-[9px] font-bold text-neutral-400 mt-2">{files.govt_id ? files.govt_id.name : "NIN / License / Passport"}</p>
                                        {files.govt_id && <div className="absolute top-4 right-4"><CheckCircle2 className="w-6 h-6 text-[#BEF264]" /></div>}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'govt_id')} />
                                </label>

                                {/* Selfie */}
                                <label className="relative group cursor-pointer">
                                    <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center hover:border-[#BEF264] transition-all group-hover:scale-[1.02]">
                                        <div className="w-16 h-16 bg-white dark:bg-black rounded-3xl flex items-center justify-center mb-4 shadow-xl">
                                            <Camera className="w-8 h-8 text-neutral-400" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Selfie with ID</p>
                                        <p className="text-[9px] font-bold text-neutral-400 mt-2">{files.selfie ? files.selfie.name : "Hold ID near your face"}</p>
                                        {files.selfie && <div className="absolute top-4 right-4"><CheckCircle2 className="w-6 h-6 text-[#BEF264]" /></div>}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} />
                                </label>

                                {/* CAC */}
                                <label className="relative group cursor-pointer opacity-80">
                                    <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center hover:border-purple-500 transition-all group-hover:scale-[1.02]">
                                        <div className="w-16 h-16 bg-white dark:bg-black rounded-3xl flex items-center justify-center mb-4 shadow-xl">
                                            <Building2 className="w-8 h-8 text-neutral-400" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Business CAC</p>
                                        <p className="text-[9px] font-bold text-neutral-400 mt-2">{files.cac ? files.cac.name : "(Optional for badge)"}</p>
                                        {files.cac && <div className="absolute top-4 right-4"><CheckCircle2 className="w-6 h-6 text-purple-600" /></div>}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'cac')} />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Actions */}
            <footer className="fixed bottom-0 w-full bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-white/5 px-6 py-6 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={prevStep}
                        disabled={currentStep === 0 || loading}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all disabled:opacity-0"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => { document.cookie = 'skip_compliance=true; path=/'; window.location.reload(); }} className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white underline decoration-dashed underline-offset-4 ml-4">Skip for now</button>
                    
                    <button 
                        onClick={nextStep}
                        disabled={loading || (currentStep === 0 && (!formData.full_name || !formData.phone)) || (currentStep === 1 && !formData.office_address) || (currentStep === 2 && (!formData.bank_name || !formData.account_number)) || (currentStep === 3 && (!files.govt_id || !files.selfie))}
                        className={`group relative flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50
                            ${currentStep === STEPS.length - 1 ? 'bg-red-600 text-white shadow-2xl shadow-red-500/30' : 'bg-black dark:bg-[#BEF264] text-white dark:text-black'}
                        `}
                    >
                        {loading ? 'Processing...' : currentStep === STEPS.length - 1 ? 'Finish & Submit' : 'Continue'}
                        <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${loading ? 'hidden' : ''}`} />
                    </button>
                </div>
            </footer>
        </div>
    );
}
