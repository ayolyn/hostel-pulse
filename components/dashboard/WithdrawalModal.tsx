"use client";

import { useState, useEffect, useRef } from "react";
import { X, Building, Hash, User, Loader2, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { getNigerianBanks } from "@/app/actions/flutterwave";

interface Bank {
    id: number;
    code: string;
    name: string;
}

interface WithdrawalModalProps {
    userId: string;
    onClose: () => void;
    onSuccess: (newBalance: number) => void;
}

export function WithdrawalModal({ userId, onClose, onSuccess }: WithdrawalModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    // Step 1 State
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [bankCode, setBankCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankAccountId, setBankAccountId] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [searchBank, setSearchBank] = useState("");
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [identityMatch, setIdentityMatch] = useState(false);
    
    // Step 2 State
    const [amount, setAmount] = useState("");
    const [balance, setBalance] = useState(0); // Optional: fetch balance or pass as prop
    
    // Step 3 State
    const [pin, setPin] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowBankDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch Banks
    useEffect(() => {
        if (banks.length === 0) {
            setLoadingBanks(true);
            getNigerianBanks().then(res => {
                if (res.success && res.banks) {
                    setBanks(res.banks);
                } else {
                    toast.error("Failed to load banks.");
                }
                setLoadingBanks(false);
            });
        }
    }, [banks.length]);

    // Verify Bank Account
    useEffect(() => {
        if (accountNumber.length === 10 && bankCode) {
            const verifyAccount = async () => {
                setVerifying(true);
                setAccountName("");
                setIdentityMatch(false);
                
                try {
                    const bank = banks.find(b => b.code === bankCode);
                    const res = await fetch('/api/wallet/verify-bank', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            account_number: accountNumber,
                            bank_code: bankCode,
                            bank_name: bank?.name
                        })
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok && data.success) {
                        setAccountName(data.data.account_name);
                        setBankAccountId(data.data.id);
                        setIdentityMatch(true);
                    } else {
                        setAccountName(data.resolvedName || "");
                        toast.error(data.error || "Could not verify account.");
                    }
                } catch (error) {
                    toast.error("An error occurred while verifying the account.");
                } finally {
                    setVerifying(false);
                }
            };
            
            const timeoutId = setTimeout(() => {
                verifyAccount();
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setAccountName("");
            setIdentityMatch(false);
        }
    }, [accountNumber, bankCode, userId, banks]);

    const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(searchBank.toLowerCase()));

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!identityMatch) {
            toast.error("Account identity must match your profile to proceed.");
            return;
        }
        setStep(2);
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = Number(amount);
        if (withdrawAmount < 100) {
            toast.error("Minimum withdrawal is ₦100.");
            return;
        }
        setStep(3);
    };

    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            toast.error("PIN must be 4 digits.");
            return;
        }
        
        setWithdrawing(true);
        try {
            const res = await fetch('/api/wallet/request-withdrawal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    amount: Number(amount),
                    bankAccountId,
                    pin
                })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                toast.success("Withdrawal processed successfully!");
                // Simulating balance reduction for UI purposes
                onSuccess(balance - Number(amount));
                onClose();
            } else {
                toast.error(data.error || "Failed to process withdrawal.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setWithdrawing(false);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={handleStep1Submit} className="p-6 md:p-5 space-y-6">
            <div className="space-y-4">
                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Bank Name</label>
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            className="relative flex items-center cursor-pointer"
                            onClick={() => setShowBankDropdown(!showBankDropdown)}
                        >
                            <Building className="absolute left-4 text-gray-400 w-5 h-5 z-10" />
                            <input
                                type="text"
                                readOnly
                                value={banks.find(b => b.code === bankCode)?.name || ""}
                                placeholder={loadingBanks ? "Loading banks..." : "Select Bank"}
                                className="w-full bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all cursor-pointer"
                                required
                                disabled={loadingBanks}
                            />
                        </div>
                        
                        {showBankDropdown && (
                            <div className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-60 flex flex-col">
                                <div className="p-2 border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                                    <input 
                                        type="text" 
                                        placeholder="Search bank..."
                                        value={searchBank}
                                        onChange={e => setSearchBank(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 rounded-xl py-2 px-3 text-sm focus:outline-none text-gray-900 dark:text-white font-bold"
                                        autoFocus
                                    />
                                </div>
                                <div className="overflow-y-auto flex-1 p-1">
                                    {filteredBanks.map(bank => (
                                        <div 
                                            key={bank.code}
                                            onClick={() => {
                                                setBankCode(bank.code);
                                                setShowBankDropdown(false);
                                                setSearchBank("");
                                            }}
                                            className="p-3 text-sm font-bold rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-900 dark:text-white"
                                        >
                                            {bank.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Number</label>
                    <div className="relative flex items-center">
                        <Hash className="absolute left-4 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="10-digit number"
                            className="w-full bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Name</label>
                    <div className="relative flex items-center">
                        {verifying ? (
                            <Loader2 className="absolute left-4 text-[#BEF264] w-5 h-5 animate-spin" />
                        ) : (
                            <User className="absolute left-4 text-gray-400 w-5 h-5" />
                        )}
                        <input
                            type="text"
                            value={accountName}
                            readOnly
                            placeholder="Auto-filled upon verification"
                            className={`w-full bg-gray-50 dark:bg-neutral-900/50 border ${!identityMatch && accountName ? 'border-red-500/50 text-red-500' : identityMatch ? 'border-emerald-500/50 text-emerald-600' : 'border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'} rounded-2xl py-3 pl-12 pr-4 font-black text-sm focus:outline-none transition-all cursor-not-allowed`}
                        />
                        {identityMatch && (
                            <CheckCircle2 className="absolute right-4 text-emerald-500 w-5 h-5" />
                        )}
                    </div>
                    {accountName && !identityMatch && (
                        <p className="text-red-500 text-[10px] font-black mt-2">Identity match failed. Name mismatch.</p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={!identityMatch}
                className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs py-3 rounded-2xl hover:bg-[#a6d456] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
                Proceed <ArrowRight className="w-4 h-4" />
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleStep2Submit} className="p-6 md:p-5 space-y-6">
            <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div>
                        <p className="text-xs font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-widest">Verified Account</p>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1">{accountName}</p>
                        <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">{banks.find(b => b.code === bankCode)?.name} - {accountNumber}</p>
                    </div>
                </div>

                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Amount (₦)</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400 w-5 h-5 flex items-center justify-center font-black text-lg">₦</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                            required
                            min="100"
                        />
                    </div>
                </div>
                
                {Number(amount) > 0 && (
                    <div className="flex justify-between items-center px-2 py-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fee</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">₦50</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-black uppercase tracking-widest text-xs py-3 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs py-3 rounded-2xl hover:bg-[#a6d456] transition-all flex items-center justify-center gap-2"
                >
                    Next <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </form>
    );

    const renderStep3 = () => (
        <form onSubmit={handleStep3Submit} className="p-6 md:p-5 space-y-6">
            <div className="text-center mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">You are withdrawing</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">₦{Number(amount).toLocaleString()}</h3>
            </div>
            
            <div className="space-y-4">
                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block text-center">Enter 4-Digit PIN</label>
                    <div className="relative flex justify-center">
                        <input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="w-32 text-center bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white font-black text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={withdrawing}
                    className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-black uppercase tracking-widest text-xs py-3 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={withdrawing || pin.length !== 4}
                    className="flex-1 bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs py-3 rounded-2xl hover:bg-[#a6d456] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {withdrawing ? 'Processing...' : 'Withdraw'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-3xl shadow-2xl overflow-y-auto max-h-[85vh] border border-gray-100 dark:border-white/10 relative">
                
                <div className="p-6 md:p-5 flex flex-col items-center border-b border-gray-100 dark:border-white/5 relative bg-neutral-50 dark:bg-neutral-900/50">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/50 dark:bg-neutral-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-[#BEF264]' : 'bg-gray-200 dark:bg-white/10'}`} />
                        <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-[#BEF264]' : 'bg-gray-200 dark:bg-white/10'}`} />
                        <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-[#BEF264]' : 'bg-gray-200 dark:bg-white/10'}`} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center">
                        Request Payout
                    </h3>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1 text-center">
                        {step === 1 ? 'Verify Identity' : step === 2 ? 'Amount & Details' : 'Security PIN'}
                    </p>
                </div>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
}
