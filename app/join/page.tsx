"use client";
export const runtime = 'edge';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Home, Briefcase, Building2, ChevronRight, AlertCircle, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';



function JoinPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const params = searchParams.toString();
        router.replace(`/auth${params ? `?${params}` : ''}`);
    }, [router, searchParams]);

    const errorParam = searchParams.get('error');
    const initialRole = searchParams.get('role') === 'Business' ? 'agent' : 'student';

    const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(errorParam === 'auth_failed' ? 'Authentication failed — please try again.' : '');
    const [successMsg, setSuccessMsg] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const supabase = createClient();

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        const supabase = createClient();

        if (mode === 'signup') {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error("SignUp Error:", error);
                setErrorMsg(error.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                // Supabase signUp returns a user object even if the email exists (for security)
                // but the identities array will be empty if it's a conflict and "Enable email confirmations" is on.
                // However, most reliable way is checking if data.user.identities exists and has length.
                const isNewUser = data.user.identities && data.user.identities.length > 0;

                if (!isNewUser) {
                    setErrorMsg("This email is already registered. Please sign in instead.");
                    setMode('signin');
                    setLoading(false);
                    return;
                }

                if (!data.session) {
                    setErrorMsg("Account created! Please check your email to confirm, then sign in.");
                    setMode('signin');
                    setLoading(false);
                    return;
                }
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error("SignIn Error:", error);
                if (error.message === "Invalid login credentials") {
                    setErrorMsg("Invalid credentials. If you just signed up, please ensure you confirmed your email.");
                } else {
                    setErrorMsg(error.message);
                }
                setLoading(false);
                return;
            }
        }

        // Give Supabase a moment to set cookies, then hard redirect to /dashboard
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 500);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);
        const supabase = createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });

        if (error) {
            console.error("Recovery Error:", error);
            setErrorMsg(error.message);
        } else {
            setSuccessMsg("Recovery link sent! Please check your email inbox (and spam folder).");
        }
        setLoading(false);
    };

    const handleResendConfirmation = async () => {
        if (!email) {
            setErrorMsg("Please enter your email address first.");
            return;
        }
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        const supabase = createClient();
        
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        });

        if (error) {
            console.error("Resend Error:", error);
            setErrorMsg(error.message);
        } else {
            setSuccessMsg("Verification link sent! Please check your inbox.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#BEF264] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-lg mt-12 bg-[#1E293B]/50 backdrop-blur-2xl p-6 rounded-3xl border border-white/5 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight uppercase">
                        {mode === 'signup' && 'Create Account'}
                        {mode === 'signin' && 'Welcome Back'}
                        {mode === 'forgot-password' && 'Reset Password'}
                    </h1>
                    <p className="text-gray-400 font-medium">
                        {mode === 'signup' && 'Join the coolest housing platform in Ogbomoso.'}
                        {mode === 'signin' && 'Sign in to access your dashboard.'}
                        {mode === 'forgot-password' && 'Enter your email to receive a recovery link.'}
                    </p>
                </div>

                {/* Status Banners */}
                {errorMsg && (
                    <div className="flex items-start gap-4 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] p-5 mb-6 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Error</p>
                            <p className="text-sm font-bold">{errorMsg}</p>
                            {(errorMsg.toLowerCase().includes('confirm') || errorMsg.toLowerCase().includes('credentials')) ? (
                                <button 
                                    type="button"
                                    onClick={handleResendConfirmation}
                                    className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all flex items-center gap-2"
                                >
                                    <Mail className="w-3 h-3" /> Resend Confirmation Link
                                </button>
                            ) : errorMsg.includes('limit') && (
                                <p className="text-[10px] mt-2 opacity-70">Tip: Google Login usually bypasses email rate limits.</p>
                            )}
                        </div>
                    </div>
                )}

                {successMsg && (
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] p-5 mb-6 text-emerald-400">
                        <Mail className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold">{successMsg}</p>
                    </div>
                )}



                {/* Google Sign-In */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-3 rounded-[1.5rem] mb-6 hover:bg-gray-100 transition-all active:scale-95 shadow-xl tracking-wide disabled:opacity-60"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                        <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {loading ? 'Processing...' : 'Continue with Google'}
                    {!loading && <ChevronRight className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-4 mb-6 text-gray-500">
                    <div className="h-[1px] bg-gray-800 flex-grow" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Or with email</span>
                    <div className="h-[1px] bg-gray-800 flex-grow" />
                </div>

                {/* Email Form */}
                <form onSubmit={mode === 'forgot-password' ? handleForgotPassword : handleEmailSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                        />
                    </div>
                    {mode !== 'forgot-password' && (
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                            />
                        </div>
                    )}

                    {mode === 'signin' && (
                        <div className="text-right px-2">
                            <button 
                                type="button"
                                onClick={() => {
                                    setMode('forgot-password');
                                    setErrorMsg('');
                                    setSuccessMsg('');
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-3 rounded-full hover:bg-[#a6d456] transition-transform active:scale-95 shadow-lg shadow-[#BEF264]/20 disabled:opacity-60 mt-2 text-sm"
                    >
                        {loading ? 'Processing...' : (
                            mode === 'signup' ? 'Sign Up' : 
                            mode === 'signin' ? 'Sign In' : 
                            'Send Link'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-400 font-medium mt-6">
                    {mode === 'signup' && 'Already have an account?'}
                    {mode === 'signin' && 'Need an account?'}
                    {mode === 'forgot-password' && 'Back to'}
                    
                    <button
                        type="button"
                        onClick={() => {
                            if (mode === 'forgot-password') {
                                setMode('signin');
                            } else {
                                setMode(mode === 'signup' ? 'signin' : 'signup');
                            }
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                        className="text-white font-black ml-2 hover:underline focus:outline-none"
                    >
                        {mode === 'signup' && 'Sign In'}
                        {mode === 'signin' && 'Sign Up'}
                        {mode === 'forgot-password' && 'Sign In'}
                    </button>
                </p>

                {mode === 'signup' && (
                    <p className="text-center text-gray-500 text-xs mt-6">
                        By continuing, you agree to{' '}
                        <span className="text-white font-bold cursor-pointer underline underline-offset-4">HOSTELPULSE Terms</span>
                        {' '}and{' '}
                        <span className="text-white font-bold cursor-pointer underline underline-offset-4">Privacy Policy</span>.
                    </p>
                )}
            </div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A]" />}>
            <JoinPageContent />
        </Suspense>
    );
}
