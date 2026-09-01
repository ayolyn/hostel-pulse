"use client";
export const runtime = 'edge';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, ChevronRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { HostelPulseLogo } from '@/components/ui/HostelPulseLogo';
import { createClient } from '@/lib/supabase/client';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

function AuthPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const modeParam = searchParams.get('mode');
    
    const [mode, setMode] = useState<'signin' | 'signup' | 'verify'>('signin');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

    // Handle initial mode from URL
    useEffect(() => {
        if (modeParam === 'signin') setMode('signin');
        if (modeParam === 'signup') setMode('signup');
    }, [modeParam]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setErrorMsg('Please enter your email address first.');
            return;
        }
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            setErrorMsg(error.message);
        } else {
            setSuccessMsg('Password reset link sent to your email!');
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (mode === 'signup' && !agreedToTerms) {
            setErrorMsg('You must agree to the Terms and Privacy Promise.');
            return;
        }

        setLoading(true);
        const supabase = createClient();

                if (mode === 'verify') {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'signup'
            });

            if (error) {
                setErrorMsg(error.message);
                setLoading(false);
                return;
            }
            
            router.push('/dashboard');
            return;
        }

        if (mode === 'signup') {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        full_name: `${firstName} ${lastName}`,
                        phone: phoneNumber,
                        terms_accepted: true,
                        terms_accepted_at: new Date().toISOString(),
                    },
                },
            });

            if (error) {
                setErrorMsg(error.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                // Ensure the user has a profile record so foreign key constraints on messages/chat_rooms don't fail
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: `${firstName} ${lastName}`,
                    phone: phoneNumber,
                    avatar_url: null,
                });

                // Welcome Notification
                await supabase.from('notifications').insert({
                    user_id: data.user.id,
                    title: 'Welcome to HostelPulse! 🚀',
                    message: 'We are thrilled to have you here. Complete your profile and explore the platform.',
                    type: 'info'
                });

                if (!data.session) {
                    setSuccessMsg("Account created! Please check your email to confirm, then sign in.");
                    setMode('signin');
                } else {
                    router.push('/dashboard');
                }
            }
        } else {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                setErrorMsg(error.message);
                setLoading(false);
                return;
            }

            // Check if user is suspended via user_metadata
            if (authData?.user?.user_metadata?.suspended) {
                await supabase.auth.signOut();
                setErrorMsg('Your account has been suspended by administration. Please contact support if you believe this is a mistake.');
                setLoading(false);
                return;
            }

            router.push('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#BEF264] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-lg mt-12 bg-[#1E293B]/50 backdrop-blur-2xl p-6 rounded-3xl border border-white/5 relative z-10 shadow-2xl">
                
                <div className="flex justify-center mb-10">
                    <HostelPulseLogo variant="dark" size={64} className="hover:scale-105 transition-transform" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight uppercase">
                        {mode === 'signup' && 'Create Account'}
                        {mode === 'signin' && 'Welcome Back'}
                    </h1>
                    <p className="text-gray-400 font-medium">
                        {mode === 'signup' && 'Join the coolest housing platform in Ogbomoso.'}
                        {mode === 'signin' && 'Sign in to access your dashboard.'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1.5 bg-white/5 rounded-full mb-10 relative">
                    <div 
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#BEF264] rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(190,242,100,0.2)] ${mode === 'signup' ? 'translate-x-full' : 'translate-x-0'}`}
                    />
                    <button 
                        onClick={() => setMode('signin')}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300 ${mode === 'signin' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => setMode('signup')}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300 ${mode === 'signup' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Status Messages */}
                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="mb-6 p-4 bg-[#BEF264]/10 border border-[#BEF264]/20 rounded-[1.5rem] flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 text-[#BEF264] shrink-0" />
                        <p className="text-sm text-[#BEF264] font-medium">{successMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'verify' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <p className="text-gray-400 text-sm mb-6 text-center">
                                Enter the 6-digit code sent to <strong className="text-white">{email}</strong>
                            </p>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#BEF264]" />
                                <input 
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-14 pr-6 text-white text-center tracking-[0.5em] text-lg focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-bold placeholder-gray-500"
                                />
                            </div>
                        </div>
                    )}
                    {mode === 'signup' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                                />
                            </div>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                                />
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="relative animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="phone-input-container">
                                <PhoneInput
                                    international
                                    defaultCountry="NG"
                                    value={phoneNumber}
                                    onChange={setPhoneNumber}
                                    className="custom-phone-input"
                                />
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-14 pr-24 text-white text-sm focus:outline-none focus:border-[#BEF264] focus:bg-white/10 transition-all font-medium placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        {mode === 'signin' && (
                            <button 
                                onClick={handleForgotPassword}
                                type="button" 
                                className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-[#BEF264] hover:underline"
                            >
                                Forgot?
                            </button>
                        )}
                    </div>

                    {mode === 'signup' && (
                        <div className="flex items-start gap-3 px-2 pt-2 animate-in fade-in duration-1000">
                            <input 
                                type="checkbox"
                                id="terms-checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#BEF264] focus:ring-[#BEF264]/20"
                            />
                            <label htmlFor="terms-checkbox" className="text-xs text-gray-400 font-medium leading-relaxed">
                                I have read and agree to the HostelPulse Terms & Privacy Policy.
                            </label>
                        </div>
                    )}

                    <button 
                        disabled={loading || (mode === 'signup' && !agreedToTerms)}
                        className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-3 rounded-full hover:bg-[#a6d456] transition-transform active:scale-95 shadow-lg shadow-[#BEF264]/20 disabled:opacity-30 disabled:scale-100 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4 text-sm"
                    >
                        {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : mode === 'verify' ? 'Verify Code' : 'Create Account')}
                        {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-8">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">OR</span>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                <button 
                    onClick={handleGoogleSignIn}
                    type="button"
                    className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-3 rounded-full hover:bg-gray-100 transition-all active:scale-95 shadow-xl tracking-wide disabled:opacity-60 text-xs uppercase"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                        <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Legal Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                        By continuing, you agree to HOSTELPULSE <button onClick={() => { setIsLegalModalOpen(true); setLegalModalTab('terms'); }} className="text-white hover:text-[#BEF264] underline transition-colors font-bold">Terms</button> and <button onClick={() => { setIsLegalModalOpen(true); setLegalModalTab('privacy'); }} className="text-white hover:text-[#BEF264] underline transition-colors font-bold">Privacy Policy</button>.
                    </p>
                </div>
            </div>

            {/* Legal Modal */}
            {isLegalModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
                    <div className="bg-[#1E293B] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="p-5 border-b border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Legal Hub</h2>
                                <button onClick={() => setIsLegalModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors group">
                                    <Image 
                                        src="/logo-icon.png" 
                                        alt="HostelPulse" 
                                        width={20} 
                                        height={20} 
                                        className="w-5 h-5 object-contain group-hover:scale-110 transition-transform" 
                                        style={{ animation: 'heartbeat 1.2s ease-in-out infinite' }}
                                    />
                                </button>
                            </div>
                            <div className="flex p-1.5 bg-white/5 rounded-full">
                                <button 
                                    onClick={() => setLegalModalTab('terms')}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-full transition-all ${legalModalTab === 'terms' ? 'bg-[#BEF264] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Terms of Service
                                </button>
                                <button 
                                    onClick={() => setLegalModalTab('privacy')}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-full transition-all ${legalModalTab === 'privacy' ? 'bg-[#BEF264] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Privacy Promise
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-gray-400 leading-relaxed custom-scrollbar">
                            {legalModalTab === 'terms' ? (
                                <>
                                    <div className="mb-8 p-5 bg-[#BEF264]/10 border border-[#BEF264]/20 rounded-3xl">
                                        <h3 className="text-[#BEF264] font-black text-sm uppercase tracking-widest mb-3">The "Human-Readable" Summary (TL;DR)</h3>
                                        <ul className="space-y-3 text-white/90">
                                            <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#BEF264] shrink-0 mt-0.5" /> <span><strong className="text-white">No Scams:</strong> We have zero tolerance for fake listings. If you lie, you get banned.</span></li>
                                            <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#BEF264] shrink-0 mt-0.5" /> <span><strong className="text-white">The Vault (Escrow):</strong> We hold inspection fees and rent safely. Money is only released when the job is done or the student moves in.</span></li>
                                            <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#BEF264] shrink-0 mt-0.5" /> <span><strong className="text-white">Identity:</strong> Agents and Landlords must provide valid ID to be "Verified."</span></li>
                                            <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#BEF264] shrink-0 mt-0.5" /> <span><strong className="text-white">Your Privacy:</strong> We only use your phone number to connect you for housing—we don’t sell your data.</span></li>
                                        </ul>
                                    </div>

                                    <h3 className="text-white font-bold text-xl uppercase tracking-tight mb-4">Full Terms of Service</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-white font-bold mb-2">A. User Verification & Accounts</h4>
                                            <p>By creating a HostelPulse account, you agree to provide accurate information. For Agents and Landlords, "Verified" status requires the submission of government-issued identification. HostelPulse reserves the right to suspend any account suspected of fraudulent activity without prior notice.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-2">B. The "Vault" & Escrow Payments</h4>
                                            <p>HostelPulse acts as a neutral third-party escrow service.</p>
                                            <ul className="list-disc pl-5 mt-2 space-y-2">
                                                <li><strong>Inspection Fees:</strong> The ₦2,000 inspection fee is held in the Vault. It is released to the Agent only after the inspection is confirmed via the System Pulse.</li>
                                                <li><strong>Rent Payments:</strong> For listings processed via "Start Offer via Escrow," funds are held securely until the student confirms move-in or a 48-hour "grace period" expires after the move-in date.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-2">C. Listing Accuracy</h4>
                                            <p>Agents are responsible for ensuring that amenities (water, light, security) are exactly as described. If a student discovers significant discrepancies during inspection, they are entitled to a full refund of the inspection fee, and the Agent may face a "Pulse Rating" penalty.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-2">D. Limitation of Liability</h4>
                                            <p>HostelPulse is a platform connecting seekers and providers. While we verify identities and secure payments, we are not responsible for the physical condition of the hostels or the conduct of users outside the platform’s digital environment.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-2">E. Communication</h4>
                                            <p>By using HostelPulse, you consent to receive transaction-related notifications via WhatsApp and SMS to the phone number provided during sign-up.</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-white font-bold text-xl uppercase tracking-tight mb-4">Our Privacy Promise</h3>
                                    <p className="mb-6">We believe your data should work for you, not against you. HostelPulse is committed to radical transparency in how we handle your information.</p>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-white font-bold mb-2">1. Data Minimization</h4>
                                            <p>We only collect the data necessary to facilitate your housing search or business operations. This includes your name, contact details, and platform interactions.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-2">2. No Third-Party Sales</h4>
                                            <p>We will never sell your personal information to third-party advertisers or data brokers. Your profile is yours alone.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-2">3. The 'Pulse' System</h4>
                                            <p>We use behavioral analytics to power our 'Pulse' real-time trust indicators. This data is used exclusively to protect the community from fraud and bad actors.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-2">4. Your Rights</h4>
                                            <p>You have the right to request a full export of your data or the deletion of your account at any time through our support channels.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-5 border-t border-white/5 flex justify-end">
                            <button 
                                onClick={() => setIsLegalModalOpen(false)}
                                className="bg-[#BEF264] text-black px-10 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] active:scale-95 transition-all shadow-lg shadow-[#BEF264]/20"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-phone-input {
                    display: flex !important;
                    align-items: center;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 9999px;
                    padding-left: 1.5rem;
                    transition: all 0.2s;
                }
                .custom-phone-input:focus-within {
                    border-color: #BEF264;
                    background: rgba(255, 255, 255, 0.1);
                }
                .custom-phone-input .PhoneInputInput {
                    background: transparent;
                    border: none;
                    color: white;
                    padding: 1.25rem 1.5rem;
                    font-size: 0.875rem;
                    width: 100%;
                    outline: none;
                    font-weight: 500;
                }
                .custom-phone-input .PhoneInputCountrySelect {
                    background: transparent;
                    color: white;
                }
                .custom-phone-input .PhoneInputInput::placeholder {
                    color: #6B7280;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B]" />}>
            <AuthPageContent />
        </Suspense>
    );
}
