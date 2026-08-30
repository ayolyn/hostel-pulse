export const runtime = 'edge';
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AgentTermsPage() {
    const router = useRouter();
    const supabase = createClient();
    
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [hasAccepted, setHasAccepted] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const checkUserStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            setUserId(user.id);

            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (roleData) {
                setRole(roleData.role);
                
                // Check cookie instead of DB
                const cookieStr = document.cookie;
                const cookieName = `terms_status_${user.id}=`;
                const cookieExists = cookieStr.split(';').some(c => c.trim().startsWith(cookieName));

                if (!cookieExists && (roleData.role === 'landlord' || roleData.role === 'agent')) {
                    setHasAccepted(false);
                }
            }
            
            setLoading(false);
        };
        
        checkUserStatus();
    }, [supabase]);

    const handleAction = (status: 'accepted' | 'skipped') => {
        if (!userId) return;
        setSubmitting(true);
        
        // Set cookie for 1 year
        const d = new Date();
        d.setTime(d.getTime() + (365*24*60*60*1000));
        document.cookie = `terms_status_${userId}=${status};expires=${d.toUTCString()};path=/`;
        
        setHasAccepted(true);
        router.push('/dashboard');
        router.refresh();
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-[#BEF264] animate-spin"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center py-12 px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#BEF264] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-3xl bg-[#1E293B]/50 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] border border-white/5 relative z-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#BEF264]/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#BEF264]" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                            HostelPulse Agent Agreement
                        </h1>
                        <p className="text-gray-400 font-medium text-sm mt-1">
                            Terms of Service for Landlords and Agents
                        </p>
                    </div>
                </div>

                {errorMsg && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 text-red-500">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold">{errorMsg}</p>
                    </div>
                )}

                <div className="prose prose-invert max-w-none text-gray-300 font-medium space-y-8 h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. DEFINITIONS AND INTERPRETATIONS</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>“Effective Date”</strong> means the date the Agent/Landlord signs up on the Platform by ticking the “I agree” feature.</li>
                            <li><strong>“Platform”</strong> means the HostelPulse App or website.</li>
                            <li><strong>“Transaction”</strong> means the successful payment of rent, agency fees, or connection fees placed by the User on the Platform.</li>
                            <li><strong>“Property Content”</strong> means the property descriptions, facility details, rent prices, images, or photographs of the hostels uploaded by the Agent.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. SERVICES</h2>
                        <p className="mb-2">HostelPulse shall provide the following Services to the Agent:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Promote and manage property listings to students and prospective tenants.</li>
                            <li>Facilitate roommate matching and housing connection services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. OBLIGATIONS OF THE AGENT / LANDLORD</h2>
                        <p className="mb-2">The Agent shall perform the following obligations:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Provide accurate Property Content and facility details upon sign-up.</li>
                            <li>Ensure that the listed properties are safe, legally available for rent, and accurately represented without misleading photographs.</li>
                            <li>Maintain all requisite licenses required by law to lease and manage real estate in Nigeria.</li>
                            <li>Allow HostelPulse to use the Property Content to advertise on social media at no cost.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. FEES AND SETTLEMENT</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>In consideration of the Services, the Agent shall pay HostelPulse the agreed commission based on the selected Pricing Tier (“Fee”).</li>
                            <li>Where payments are processed directly through the Platform, HostelPulse shall be entitled to deduct the Fee at source and transfer the balance to the Agent&apos;s designated bank account within +1 Business Day.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. REPRESENTATIONS AND WARRANTIES</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>The Agent warrants that they are the legal owner of the property or have the documented legal authority to lease the property.</li>
                            <li>The Agent warrants that all information supplied is accurate and does not constitute any misrepresentation or fraud.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. INDEMNITY & LIMITATION OF LIABILITY</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>The Agent agrees to indemnify HostelPulse for any direct loss, injury, or damages arising from a breach of tenancy laws, unsafe living conditions, or fraudulent listings.</li>
                            <li>HostelPulse’s maximum liability to the Agent is limited to the commission fees paid to HostelPulse for the specific transaction in dispute.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. DATA PROTECTION & NON-DISCRIMINATION</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Each Party shall comply with the Nigeria Data Protection Act 2023. The Agent agrees not to misuse student data, phone numbers, or personal information for any purpose outside of finalizing the tenancy agreement.</li>
                            <li>The Agent shall not engage in any form of discrimination or harassment toward any student. Violation of this will result in immediate termination.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">8. SUSPENSION OF SERVICE & DISPUTE RESOLUTION</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>HostelPulse shall immediately suspend the Agent&apos;s account where the Platform is misused, fraudulent listings are detected, or multiple reports of scam/harassment are received.</li>
                            <li>This Agreement shall be governed by the laws of the Federal Republic of Nigeria. Unresolved disputes shall be submitted to Mediation at a recognized Multi-Door Courthouse in Nigeria.</li>
                        </ul>
                    </section>
                </div>

                {userId && (role === 'landlord' || role === 'agent') && !hasAccepted ? (
                    <div className="mt-10 pt-8 border-t border-white/10">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 mb-6 text-yellow-500 flex items-start gap-4">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold mb-1">Action Required</h4>
                                <p className="text-sm">You can accept the HostelPulse Agent Agreement to continue accessing your dashboard, or skip it for now.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleAction('skipped')}
                                disabled={submitting}
                                className="w-1/3 bg-white/5 text-white font-black uppercase tracking-widest py-5 rounded-[1.5rem] hover:bg-white/10 transition-all text-sm"
                            >
                                Skip for Now
                            </button>
                            <button
                                onClick={() => handleAction('accepted')}
                                disabled={submitting}
                                className="w-2/3 flex items-center justify-center gap-3 bg-[#BEF264] text-black font-black uppercase tracking-widest py-5 rounded-[1.5rem] hover:bg-[#a6d456] transition-all active:scale-95 shadow-xl shadow-[#BEF264]/20 disabled:opacity-60 text-sm"
                            >
                                {submitting ? 'Updating...' : 'I Have Read and Agree'}
                                {!submitting && <CheckCircle2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-10 pt-8 border-t border-white/10 flex justify-center">
                        <button
                            onClick={() => router.back()}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-white font-bold transition-colors text-sm"
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}} />
        </div>
    );
}
