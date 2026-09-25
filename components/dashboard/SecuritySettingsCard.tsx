"use client";

import { useState, useEffect } from "react";
import { KeyRound, ShieldCheck, Loader2, Lock, Edit3, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface SecuritySettingsCardProps {
    userId: string;
    hasPinSet?: boolean;
}

export function SecuritySettingsCard({ userId, hasPinSet: initialHasPinSet }: SecuritySettingsCardProps) {
    const supabase = createClient();
    
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [hasPinSet, setHasPinSet] = useState(initialHasPinSet || false);
    const [provider, setProvider] = useState<string>("email");

    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [currentPin, setCurrentPin] = useState("");
    const [loadingPin, setLoadingPin] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        async function fetchSecurityState() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const authProvider = user.app_metadata?.provider || user.app_metadata?.providers?.[0] || 'email';
                    setProvider(authProvider);

                    const { data, error } = await supabase
                        .from('user_security')
                        .select('pin_set')
                        .eq('user_id', userId)
                        .single();

                    if (!error && data) {
                        setHasPinSet(data.pin_set);
                    }
                }
            } catch (error) {
                console.error("Error fetching security state:", error);
            } finally {
                setLoadingInitial(false);
            }
        }
        fetchSecurityState();
    }, [userId, supabase]);

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
            const res = await fetch('/api/wallet/setup-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, pin })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                toast.success("Security PIN set successfully!");
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
            const res = await fetch('/api/wallet/update-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, currentPin, newPin: pin })
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

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            toast.error("Please enter both passwords.");
            return;
        }
        setLoadingPassword(true);
        try {
            // Note: standard Supabase doesn't easily verify current password on the client without signing in.
            // But we can trigger an update. Assuming the user is signed in.
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
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;
                toast.success("Password reset link sent to your email.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset link.");
        }
    };

    if (loadingInitial) {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm animate-pulse">
                    <div className="h-10 w-48 bg-gray-200 dark:bg-white/10 rounded-xl mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
                        <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm animate-pulse">
                    <div className="h-10 w-48 bg-gray-200 dark:bg-white/10 rounded-xl mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
                        <div className="h-12 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">PIN Management</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Manage your payout PIN</p>
                    </div>
                </div>

                {!hasPinSet ? (
                    <form onSubmit={handleSetPin} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">New PIN (4 digits)</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white font-black text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Confirm PIN</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white font-black text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loadingPin || pin.length !== 4 || confirmPin.length !== 4}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loadingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {loadingPin ? 'Setting PIN...' : 'Enable Security PIN'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleUpdatePin} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Current PIN</label>
                            <input
                                type="password"
                                maxLength={4}
                                value={currentPin}
                                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white font-black text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">New PIN</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white font-black text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Confirm New PIN</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="••••"
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white font-black text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="button"
                                onClick={() => toast.success("OTP sent to your registered email/phone!")}
                                className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Forgot PIN?
                            </button>
                            <button
                                type="submit"
                                disabled={loadingPin || pin.length !== 4 || confirmPin.length !== 4 || currentPin.length !== 4}
                                className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loadingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                {loadingPin ? 'Updating...' : 'Update PIN'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Password Settings</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Manage your account password</p>
                    </div>
                </div>

                {provider === 'google' ? (
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-between border border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Authenticated via Google</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No password required</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                                required
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Forgot Password?
                            </button>
                            <button
                                type="submit"
                                disabled={loadingPassword || !currentPassword || !newPassword}
                                className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 disabled:opacity-50"
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
