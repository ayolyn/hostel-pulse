"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface SecuritySettingsCardProps {
    userId: string;
    hasPinSet: boolean;
}

export function SecuritySettingsCard({ userId, hasPinSet: initialHasPinSet }: SecuritySettingsCardProps) {
    const [hasPinSet, setHasPinSet] = useState(initialHasPinSet);
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
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
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Security Settings</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Manage your payout PIN</p>
                </div>
            </div>

            {hasPinSet ? (
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-between border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <KeyRound className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Transaction PIN is Active</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Required for withdrawals</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Secure
                    </span>
                </div>
            ) : (
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
                        disabled={loading || pin.length !== 4 || confirmPin.length !== 4}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        {loading ? 'Setting PIN...' : 'Enable Security PIN'}
                    </button>
                </form>
            )}
        </div>
    );
}
