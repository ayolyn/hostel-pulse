"use client";
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Home, Briefcase, Building2, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const roles = [
    {
        id: 'student',
        label: 'Student',
        icon: User,
        desc: 'Rent near LAUTECH campus',
        badge: '🎓',
    },
    {
        id: 'non_student',
        label: 'Buyer / Renter',
        icon: Building2,
        desc: 'Buy or rent as a professional',
        badge: '🏠',
    },
    {
        id: 'landlord',
        label: 'Landlord',
        icon: Home,
        desc: 'List and manage properties',
        badge: '🔑',
    },
    {
        id: 'agent',
        label: 'Agent',
        icon: Briefcase,
        desc: 'Earn from deals & inspections',
        badge: '⚡',
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();

    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [step, setStep] = useState<1 | 2>(1);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [matricNumber, setMatricNumber] = useState('');
    const [occupation, setOccupation] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/join');
                return;
            }

            setUserId(user.id);
            setUserEmail(user.email ?? '');

            // Check if already onboarded
            const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
            if (roleData?.role) {
                router.push('/dashboard');
                return;
            }

            setFullName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '');
            setLoading(false);
        };
        checkUser();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !selectedRole) return;

        setSubmitting(true);
        setErrorMsg('');

        try {
            // 1. Insert Role
            const { error: roleError } = await supabase.from('user_roles').upsert({
                user_id: userId,
                role: selectedRole
            }, { onConflict: 'user_id, role' });
            if (roleError) throw roleError;

            // 2. Insert Account Details
            let accountError;
            if (selectedRole === 'student') {
                const { error } = await supabase.from('student_accounts').upsert({
                    id: userId,
                    full_name: fullName,
                    phone: phone,
                    matric_number: matricNumber || null,
                    university: 'LAUTECH',
                    is_approved: false
                });
                accountError = error;
            } else if (selectedRole === 'non_student') {
                const { error } = await supabase.from('non_student_accounts').upsert({
                    id: userId,
                    full_name: fullName,
                    phone: phone,
                    occupation: occupation || null,
                    intent: 'rent',
                    is_approved: false
                });
                accountError = error;
            } else if (selectedRole === 'landlord') {
                const { error } = await supabase.from('landlord_accounts').upsert({
                    id: userId,
                    full_name: fullName,
                    phone: phone,
                    business_name: businessName || null,
                    whatsapp_number: whatsappNumber || null,
                    is_approved: false,
                    compliance_submitted: false
                });
                accountError = error;
            } else if (selectedRole === 'agent') {
                const { error } = await supabase.from('agent_accounts').upsert({
                    id: userId,
                    full_name: fullName,
                    phone: phone,
                    business_name: businessName || null,
                    whatsapp_number: whatsappNumber || null,
                    zone: 'Ogbomoso',
                    is_approved: false,
                    compliance_submitted: false
                });
                accountError = error;
            }

            if (accountError) throw accountError;

            // Redirect to dashboard (which will show the review screen)
            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            console.error("Onboarding error:", err);
            setErrorMsg(err.message || 'Failed to complete profile. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-[#BEF264] animate-spin"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#BEF264] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-lg mt-8 bg-[#1E293B]/50 backdrop-blur-2xl p-6 rounded-3xl border border-white/5 relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex gap-2">
                        <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-[#BEF264]' : 'bg-white/20'}`} />
                        <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-[#BEF264]' : 'bg-white/20'}`} />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
                        Step {step} of 2
                    </span>
                </div>

                {errorMsg && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 text-red-500">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold">{errorMsg}</p>
                    </div>
                )}

                {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-left mb-8">
                            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                                How are you using HOSTELPULSE?
                            </h1>
                            <p className="text-gray-400 font-medium">
                                Choose the account type that best fits you.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`p-5 border-2 rounded-[1.5rem] transition-all text-left relative group ${selectedRole === role.id
                                        ? 'border-[#BEF264] bg-[#BEF264]/5 shadow-[0_0_30px_rgba(190,242,100,0.1)]'
                                        : 'border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <span className="text-2xl mb-3 block">{role.badge}</span>
                                    <h3 className={`font-black tracking-tight text-sm ${selectedRole === role.id ? 'text-[#BEF264]' : 'text-white'
                                        }`}>
                                        {role.label}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{role.desc}</p>

                                    {selectedRole === role.id && (
                                        <div className="absolute top-4 right-4 text-[#BEF264]">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedRole}
                            className="w-full flex items-center justify-center gap-2 bg-[#BEF264] text-black font-black uppercase tracking-widest py-3 rounded-full hover:bg-[#a6d456] transition-transform active:scale-95 shadow-lg shadow-[#BEF264]/20 disabled:opacity-50 disabled:active:scale-100"
                        >
                            Continue
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-left mb-8">
                            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                                Complete your profile.
                            </h1>
                            <p className="text-gray-400 font-medium">
                                Almost there! Tell us a bit more about yourself.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="e.g. +234 800 000 0000"
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                                />
                            </div>

                            {selectedRole === 'student' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">Matric Number (Optional)</label>
                                    <input
                                        type="text"
                                        value={matricNumber}
                                        onChange={e => setMatricNumber(e.target.value)}
                                        placeholder="e.g. 210000"
                                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                                    />
                                </div>
                            )}

                            {selectedRole === 'non_student' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">Occupation (Optional)</label>
                                    <input
                                        type="text"
                                        value={occupation}
                                        onChange={e => setOccupation(e.target.value)}
                                        placeholder="e.g. Software Engineer"
                                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                                    />
                                </div>
                            )}

                            {(selectedRole === 'landlord' || selectedRole === 'agent') && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">Business / Company Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={businessName}
                                            onChange={e => setBusinessName(e.target.value)}
                                            placeholder="e.g. HOSTELPULSE Properties Co."
                                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={whatsappNumber}
                                            onChange={e => setWhatsappNumber(e.target.value)}
                                            placeholder="e.g. +234 800 000 0000"
                                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 bg-white/5 text-white font-black uppercase tracking-widest py-3 rounded-full hover:bg-white/10 transition-all text-sm"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-2/3 flex items-center justify-center gap-2 bg-[#BEF264] text-black font-black uppercase tracking-widest py-3 rounded-full hover:bg-[#a6d456] transition-transform active:scale-95 shadow-lg shadow-[#BEF264]/20 disabled:opacity-50 text-sm"
                                >
                                    {submitting ? 'Saving...' : 'Complete Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
