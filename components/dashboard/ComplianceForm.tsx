"use client";

import React, { useState } from 'react';
import { ShieldAlert, Upload, CheckCircle2, AlertCircle, FileText, User as UserIcon, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function ComplianceForm({ accountType, userId }: { accountType: 'landlord' | 'agent', userId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [govtIdFile, setGovtIdFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [cacFile, setCacFile] = useState<File | null>(null);

    const handleUpload = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('compliance_docs')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('compliance_docs')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!govtIdFile || !selfieFile) {
            setErrorMsg('Government ID and Selfie are required for verification.');
            return;
        }

        setLoading(true);

        try {
            // Upload files (if cacFile is missing, it skips that one)
            const govtIdUrl = await handleUpload(govtIdFile, 'govt_ids');
            const selfieUrl = await handleUpload(selfieFile, 'selfies');
            let cacUrl: any = null;
            
            if (cacFile) {
                cacUrl = await handleUpload(cacFile, 'cac_documents');
            }

            // Update database
            const table = accountType === 'landlord' ? 'landlord_accounts' : 'agent_accounts';
            
            const updateData: any = {
                govt_id_url: govtIdUrl,
                selfie_url: selfieUrl,
                compliance_submitted: true
            };

            if (cacUrl) updateData.cac_document_url = cacUrl;

            const { error: updateError } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', userId);

            if (updateError) throw updateError;

            setSuccessMsg('Documents submitted successfully. You will be redirected shortly.');
            
            // Refresh to trigger the "Account Under Review" layout state
            setTimeout(() => {
                router.refresh();
            }, 2000);

        } catch (err: any) {
            console.error("Compliance upload error:", err);
            setErrorMsg(err.message || 'Failed to upload documents. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-white/5 shadow-xl overflow-hidden mt-10">
            <div className="bg-red-600 p-6 flex items-start gap-4 text-white">
                <ShieldAlert className="w-8 h-8 shrink-0 mt-1" />
                <div>
                    <h2 className="text-xl font-bold">Compliance Verification Required</h2>
                    <p className="text-red-100 mt-1 text-sm">
                        To maintain a safe and scam-free environment on HOSTELPULSE, all {accountType}s are required to submit valid means of identity before listing properties.
                    </p>
                </div>
            </div>

            <div className="p-8">
                {errorMsg && (
                    <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-semibold">{errorMsg}</p>
                    </div>
                )}
                
                {successMsg && (
                    <div className="mb-6 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 p-4 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-semibold">{successMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Govt ID */}
                    <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white">Government Issued ID <span className="text-red-500">*</span></h4>
                                    <p className="text-xs text-neutral-500">NIN, Driver's License, or International Passport</p>
                                </div>
                            </div>
                        </div>
                        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-[#BEF264] focus:outline-none">
                            <div className="flex flex-col items-center space-y-2 text-center">
                                <Upload className="w-6 h-6 text-neutral-400" />
                                <span className="font-medium text-neutral-600 dark:text-neutral-400 text-sm">
                                    {govtIdFile ? govtIdFile.name : "Click to select file or drag & drop"}
                                </span>
                            </div>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setGovtIdFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>

                    {/* Selfie */}
                    <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#BEF264]/20 flex items-center justify-center text-[#9acb4b]">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white">Clear Selfie Photo <span className="text-red-500">*</span></h4>
                                    <p className="text-xs text-neutral-500">A clear, well-lit photo of your face</p>
                                </div>
                            </div>
                        </div>
                        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-[#BEF264] focus:outline-none">
                            <div className="flex flex-col items-center space-y-2 text-center">
                                <Upload className="w-6 h-6 text-neutral-400" />
                                <span className="font-medium text-neutral-600 dark:text-neutral-400 text-sm">
                                    {selfieFile ? selfieFile.name : "Click to select photo or drag & drop"}
                                </span>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>

                    {/* CAC Document */}
                    <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white">Business CAC Document</h4>
                                    <p className="text-xs text-neutral-500">Highly recommended for verified business badges</p>
                                </div>
                            </div>
                        </div>
                        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-[#BEF264] focus:outline-none">
                            <div className="flex flex-col items-center space-y-2 text-center">
                                <Upload className="w-6 h-6 text-neutral-400" />
                                <span className="font-medium text-neutral-600 dark:text-neutral-400 text-sm">
                                    {cacFile ? cacFile.name : "Click to select file or drag & drop"}
                                </span>
                            </div>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setCacFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !govtIdFile || !selfieFile}
                        className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-[#a6d456] transition-transform active:scale-95 shadow-lg shadow-[#BEF264]/20 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Uploading & Verifying...' : 'Submit Documents'}
                    </button>
                </form>
            </div>
        </div>
    );
}
