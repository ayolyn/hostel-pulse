"use client";

import { useState, useEffect, useRef } from "react";
import { X, Building, Hash, User, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { requestPayout } from "@/app/actions/wallet";
import { getNigerianBanks, resolveBankAccount } from "@/app/actions/flutterwave";

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
    const [amount, setAmount] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountError, setAccountError] = useState("");
    
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [searchBank, setSearchBank] = useState("");
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    
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

    // 1. Fetch Banks on mount
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

    // 2. Auto-verify Account Name when 10 digits & bank selected
    useEffect(() => {
        if (accountNumber.length === 10 && bankCode) {
            const verifyAccount = async () => {
                setVerifying(true);
                setAccountName("");
                setAccountError("");
                
                const res = await resolveBankAccount(accountNumber, bankCode);
                if (res.success && res.accountName) {
                    setAccountName(res.accountName);
                } else {
                    const err = res.error || "Could not verify account.";
                    toast.error(err);
                    setAccountError(err);
                    setAccountName("");
                }
                setVerifying(false);
            };
            
            // Debounce slightly to prevent double-firing
            const timeoutId = setTimeout(() => {
                verifyAccount();
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setAccountName("");
            setAccountError("");
        }
    }, [accountNumber, bankCode]);

    const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(searchBank.toLowerCase()));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!accountName) {
            toast.error("Please wait for account name verification.");
            return;
        }
        
        const withdrawAmount = Number(amount);
        if (withdrawAmount < 100) {
            toast.error("Minimum withdrawal is ₦100.");
            return;
        }

        setLoading(true);

        try {
            const res = await requestPayout({
                amount: withdrawAmount,
                bankName: bankCode, // We pass the code, flutterwave needs the code
                accountNumber
            });

            if (res.error) throw new Error(res.error);

            toast.success("Withdrawal processed successfully!");
            onSuccess(res.newBalance || 0);
            onClose();
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-3xl shadow-2xl overflow-y-auto max-h-[85vh] border border-gray-100 dark:border-white/10 relative transform scale-100 transition-transform duration-300">
                
                <div className="p-6 md:p-5 flex flex-col items-center border-b border-gray-100 dark:border-white/5 relative bg-neutral-50 dark:bg-neutral-900/50">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/50 dark:bg-neutral-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-16 bg-[#BEF264]/20 rounded-full flex items-center justify-center mb-4">
                        <span className="text-xl sm:text-2xl font-black text-[#BEF264]">₦</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center">
                        Request Payout
                    </h3>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1 text-center">
                        Withdraw funds to bank
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-5 space-y-6">
                    <div className="space-y-4">
                        {/* Amount */}
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

                        {/* Bank Selection */}
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
                                            <div className="relative flex items-center">
                                                <input 
                                                    type="text" 
                                                    placeholder="Search bank..."
                                                    value={searchBank}
                                                    onChange={e => setSearchBank(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-neutral-800 rounded-xl py-2 px-3 text-sm focus:outline-none text-gray-900 dark:text-white font-bold"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-1">
                                            {filteredBanks.length === 0 ? (
                                                <div className="p-3 text-center text-sm font-bold text-gray-500">No banks found</div>
                                            ) : (
                                                filteredBanks.map(bank => (
                                                    <div 
                                                        key={bank.code}
                                                        onClick={() => {
                                                            setBankCode(bank.code);
                                                            setShowBankDropdown(false);
                                                            setSearchBank("");
                                                        }}
                                                        className={`p-3 text-sm font-bold rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${bankCode === bank.code ? 'bg-[#BEF264]/10 text-black dark:text-[#BEF264]' : 'text-gray-900 dark:text-white'}`}
                                                    >
                                                        {bank.name}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Number */}
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

                        {/* Account Name (Verified) */}
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
                                    readOnly={true}
                                    placeholder={verifying ? 'Verifying account details...' : 'Auto-filled upon verification'}
                                    className={`w-full bg-gray-50 dark:bg-neutral-900/50 border ${accountError ? 'border-red-500/50 text-red-500' : accountName ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'} rounded-2xl py-3 pl-12 pr-4 font-black text-sm focus:outline-none transition-all cursor-not-allowed`}
                                    required
                                />
                            </div>
                            {accountError && (
                                <p className="text-red-500 text-xs font-bold mt-2">{accountError}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || verifying || !accountName}
                        className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs py-3 rounded-2xl hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Processing Transfer...' : 'Confirm Withdrawal'}
                    </button>
                </form>
            </div>
        </div>
    );
}
