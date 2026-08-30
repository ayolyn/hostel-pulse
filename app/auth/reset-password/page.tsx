export const runtime = 'edge';
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Supabase sends the recovery token as a URL hash.
        // onAuthStateChange fires with PASSWORD_RECOVERY event when the hash is present.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true);
            }
            if (event === 'SIGNED_IN' && session) {
                // The hash was consumed and resulted in a session - also ready
                setReady(true);
            }
        });

        // Also check if there's already a session (hash consumed before listener attached)
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            if (session) setReady(true);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setError("Passwords don't match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setLoading(true);
        setError('');

        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            router.push('/join');
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#BEF264] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md bg-[#1E293B]/60 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 relative z-10 shadow-2xl">
                {success ? (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-[#BEF264]/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-[#BEF264]" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight mb-2">Password Updated!</h1>
                        <p className="text-gray-400 text-sm">Redirecting you to sign in...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#BEF264]/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-[#BEF264]" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight uppercase">Set New Password</h1>
                            <p className="text-gray-400 text-sm mt-2 font-medium">
                                {ready ? 'Choose a strong password for your account.' : 'Loading secure session...'}
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleReset} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    disabled={!ready}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="New password"
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#BEF264] transition-all font-medium placeholder-gray-500 disabled:opacity-40"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    disabled={!ready}
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#BEF264] transition-all font-medium placeholder-gray-500 disabled:opacity-40"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !ready}
                                className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-4 rounded-full hover:bg-[#a6d456] transition-transform active:scale-95 shadow-lg shadow-[#BEF264]/20 disabled:opacity-50 text-sm mt-2"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
