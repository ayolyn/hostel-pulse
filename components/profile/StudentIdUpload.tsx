'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2, UploadCloud, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export function StudentIdUpload() {
    const { user } = useAuth();
    const supabase = createClient();
    
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [studentIdUrl, setStudentIdUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('student_id_url')
                .eq('id', user.id)
                .single();
                
            if (data?.student_id_url) {
                setStudentIdUrl(data.student_id_url);
            }
            setLoading(false);
        };
        
        fetchProfile();
    }, [user, supabase]);

    const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const filePath = `${user?.id}/student_id_${Date.now()}`;

            const { error: uploadError } = await supabase.storage
                .from('public_assets')
                .upload(`kyc/${filePath}`, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('public_assets').getPublicUrl(`kyc/${filePath}`);
            
            setStudentIdUrl(data.publicUrl);
            
            // Automatically Verify for Campus Market
            await supabase.from('profiles').update({ 
                student_id_url: data.publicUrl
            }).eq('id', user?.id);

            toast.success('Student ID Verified! Campus Market Unlocked.');

            // Refresh the page to unlock the market tab visually
            window.location.reload();

        } catch (error: any) {
            console.error('Error uploading Student ID:', error.message);
            toast.error('Error uploading Student ID!');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-5">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
            </div>
        );
    }

    return (
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#BEF264]" />
                <h3 className="text-lg font-bold text-black dark:text-white">Campus Market Verification</h3>
            </div>
            
            {studentIdUrl ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-emerald-700 dark:text-emerald-400">ID Verified</h4>
                        <p className="text-sm text-emerald-600 dark:text-emerald-300/80 mt-1">Your Student ID has been verified. You can now buy and sell on the Campus Market.</p>
                        
                        <a href={studentIdUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 underline underline-offset-2">
                            View Uploaded ID
                        </a>
                    </div>
                </div>
            ) : (
                <div className="bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <UploadCloud className="w-6 h-6 text-neutral-400" />
                    </div>
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Upload Student ID</h4>
                    <p className="text-sm text-neutral-500 mb-4 max-w-sm mx-auto">To maintain a safe environment, please upload a clear photo of your Lautech Student ID to access the Campus Market.</p>
                    
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-black dark:bg-[#BEF264] text-white dark:text-black font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Choose Image'}
                        <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={handleIdUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
