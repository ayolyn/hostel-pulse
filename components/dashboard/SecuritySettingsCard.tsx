"use client";

import { useState, useEffect } from "react";
import { KeyRound, ShieldCheck, Loader2, Lock, Edit3, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface SecuritySettingsCardProps {
    userId?: string;
    hasPinSet?: boolean;
}

export function SecuritySettingsCard({ userId: propUserId }: SecuritySettingsCardProps) {
    const supabase = createClient();
    
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [hasPinSet, setHasPinSet] = useState(false);
    const [isGoogleAuth, setIsGoogleAuth] = useState(false);
    const [activeUserId, setActiveUserId] = useState<string>(propUserId || "");

    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [currentPin, setCurrentPin] = useState("");
    const [loadingPin, setLoadingPin] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Forgot PIN / Reset states
    const [isResettingPin, setIsResettingPin] = useState(false);
    const [sendingForgotPin, setSendingForgotPin] = useState(false);
    const [resetPinLoading, setResetPinLoading] = useState(false);
    const [resetOtp, setResetOtp] = useState("");
    const [resetNewPin, setResetNewPin] = useState("");
    const [resetConfirmPin, setResetConfirmPin] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    useEffect(() => {
        let isMounted = true;

        async function fetchSecurityState() {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    if (isMounted) setLoadingInitial(false);
                    return;
                }

                const uid = user.id;
                if (isMounted) setActiveUserId(uid);

                // Detect auth provider (Google OAuth vs Email/Password)
                const provider = user.app_metadata?.provider || user.app_metadata?.providers?.[0] || '';
                const isGoogle = provider === 'google' || 
                    user.app_metadata?.providers?.includes('google') ||
                    user.identities?.some((id: any) => id.provider === 'google');
                
                if (isMounted) {
                    setIsGoogleAuth(Boolean(isGoogle));
                }

                // 1. Check via dedicated server endpoint (uses service role key, immune to client RLS)
                try {
                    const res = await fetch(`/api/wallet/setup-pin?userId=${uid}`, { cache: 'no-store' });
                    const resData = await res.json();
                    if (res.ok && resData.success && isMounted) {
                        setHasPinSet(Boolean(resData.hasPinSet));
                        setLoadingInitial(false);
                        return;
                    }
                } catch (apiErr) {
                    console.warn("API check fallback to supabase:", apiErr);
                }

                // 2. Fallback to direct client query (authenticated via RLS policy)
                const { data, error } = await supabase
                    .from('user_security')
                    .select('pin_set')
                    .eq('user_id', uid)
                    .maybeSingle();

                if (!error && data && isMounted) {
                    setHasPinSet(Boolean(data.pin_set));
                }
            } catch (error) {
                console.error("Error fetching security state:", error);
            } finally {
                if (isMounted) setLoadingInitial(false);
            }
        }

        fetchSecurityState();

        return () => {
            isMounted = false;
        };
    }, [propUserId]);

    const handleSetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin !== confirmPin) {
            toast.error("PINs do not match.");
            return;
        }
        if (pin.length !== 4) {
            toast.error("PIN must be 4 digits.");
            return;
        }

        setLoadingPin(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const targetUid = user?.id || activeUserId;

            if (!targetUid) {
                toast.error("User session not found. Please log in again.");
                return;
            }

            const res = await fetch('/api/wallet/setup-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: targetUid, pin })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                toast.success("Security PIN enabled successfully!");
                setHasPinSet(true);
                setPin("");
                setConfirmPin("");
            } else {
                toast.error(data.error || "Failed to set PIN.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoadingPin(false);
        }
    };

    const handleUpdatePin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin !== confirmPin) {
            toast.error("New PINs do not match.");
            return;
        }
        if (pin.length !== 4 || currentPin.length !== 4) {
            toast.error("PINs must be 4 digits.");
            return;
        }

        setLoadingPin(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const targetUid = user?.id || activeUserId;

            if (!targetUid) {
                toast.error("User session not found. Please log in again.");
                return;
            }

            const res = await fetch('/api/wallet/update-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: targetUid, currentPin, newPin: pin })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                toast.success("Security PIN updated successfully!");
                setCurrentPin("");
                setPin("");
                setConfirmPin("");
            } else {
                toast.error(data.error || "Failed to update PIN.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoadingPin(false);
        }
    };

    const handleTriggerForgotPin = async () => {
        if (cooldown > 0) return;
        setSendingForgotPin(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const targetUid = user?.id || activeUserId;

            if (!targetUid) {
                toast.error("User session not found. Please log in again.");
                return;
            }

            const res = await fetch('/api/wallet/forgot-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: targetUid })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("Verification code sent to your email!");
                setMaskedEmail(data.email || "your registered email");
                setIsResettingPin(true);
                setCooldown(60);
            } else {
                toast.error(data.error || "Failed to send reset code.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setSendingForgotPin(false);
        }
    };

    const handleResetPinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (resetOtp.length !== 6) {
            toast.error("Please enter the 6-digit verification code.");
            return;
        }
        if (resetNewPin.length !== 4) {
            toast.error("New PIN must be 4 digits.");
            return;
        }
        if (resetNewPin !== resetConfirmPin) {
            toast.error("New PINs do not match.");
            return;
        }

        setResetPinLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const targetUid = user?.id || activeUserId;

            if (!targetUid) {
                toast.error("User session not found. Please log in again.");
                return;
            }

            const res = await fetch('/api/wallet/reset-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: targetUid,
                    otp: resetOtp,
                    newPin: resetNewPin
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("Security PIN reset successfully!");
                setIsResettingPin(false);
                setHasPinSet(true);
                setResetOtp("");
                setResetNewPin("");
                setResetConfirmPin("");
            } else {
                toast.error(data.error || "Failed to reset PIN.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setResetPinLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }

        setLoadingPassword(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) throw new Error("No user email found.");

            // Verify current password first
            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });
            if (signInErr) {
                toast.error("Incorrect current password.");
                return;
            }

            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
        } catch (error: any) {
            toast.error(error.message || "Failed to update password.");
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleForgotPassword = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                });
                if (error) throw error;
                toast.success("Password reset instructions sent to your email.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset link.");
        }
    };

    if (loadingInitial) {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded-xl" />
                    <div className="h-4 w-64 bg-gray-100 dark:bg-white/5 rounded-lg" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-2xl" />
                        <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* PIN Management Section */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">PIN Management</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Manage your 4-digit payout PIN</p>
                        </div>
                    </div>

                    {hasPinSet && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">PIN Active</span>
                        </div>
                    )}
                </div>

                {isResettingPin ? (
                    <form onSubmit={handleResetPinSubmit} className="space-y-4 max-w-lg">
                        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-start gap-3 mb-2">
                            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-tight">
                                    Check Your Email
                                </p>
                                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400/90 mt-0.5">
                                    We sent a 6-digit verification code to <span className="font-bold underline">{maskedEmail}</span>. Enter it below with your new PIN.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                                6-Digit Email Code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={resetOtp}
                                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-xl tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">New PIN (4 digits)</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={resetNewPin}
                                    onChange={(e) => setResetNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Confirm New PIN</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={resetConfirmPin}
                                    onChange={(e) => setResetConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleTriggerForgotPin}
                                    disabled={cooldown > 0 || sendingForgotPin}
                                    className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
                                >
                                    {sendingForgotPin ? "Resending..." : cooldown > 0 ? `Resend Code (${cooldown}s)` : "Resend Code"}
                                </button>
                                <span className="text-gray-300 dark:text-neutral-700">|</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsResettingPin(false);
                                        setResetOtp("");
                                        setResetNewPin("");
                                        setResetConfirmPin("");
                                    }}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={resetPinLoading || resetOtp.length !== 6 || resetNewPin.length !== 4 || resetConfirmPin.length !== 4}
                                className="w-full sm:w-auto bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs py-3 px-6 rounded-2xl hover:bg-[#a6d456] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {resetPinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                {resetPinLoading ? 'Verifying...' : 'Reset Payout PIN'}
                            </button>
                        </div>
                    </form>
                ) : !hasPinSet ? (
                    <form onSubmit={handleSetPin} className="space-y-4 max-w-lg">
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-3 mb-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                                You have not enabled a Payout PIN yet. Set a 4-digit PIN below to secure withdrawals from your wallet.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">New PIN (4 digits)</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Confirm PIN</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loadingPin || pin.length !== 4 || confirmPin.length !== 4}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-3.5 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loadingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {loadingPin ? 'Enabling PIN...' : 'Enable Security PIN'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleUpdatePin} className="space-y-4 max-w-lg">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Current PIN</label>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={currentPin}
                                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="••••"
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">New PIN</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Confirm New PIN</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleTriggerForgotPin}
                                disabled={sendingForgotPin}
                                className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {sendingForgotPin && <Loader2 className="w-3 h-3 animate-spin" />}
                                {sendingForgotPin ? "Sending Code to Email..." : "Forgot PIN?"}
                            </button>
                            <button
                                type="submit"
                                disabled={loadingPin || pin.length !== 4 || confirmPin.length !== 4 || currentPin.length !== 4}
                                className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-3 px-6 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loadingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                {loadingPin ? 'Updating...' : 'Update PIN'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Password Settings Section */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Account Authentication</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Manage your account login credentials</p>
                    </div>
                </div>

                {isGoogleAuth ? (
                    <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl flex items-center gap-4 border border-blue-100 dark:border-blue-500/10 max-w-lg">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-white/5">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Signed In Via Google</p>
                            <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                                Your account is authenticated via Google Single Sign-On. You do not need a password to access Hostel Pulse. Payouts are protected by your 4-digit PIN.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Forgot Password?
                            </button>
                            <button
                                type="submit"
                                disabled={loadingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-3 px-6 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                {loadingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
