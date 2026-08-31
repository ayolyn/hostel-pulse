import React, { useState, useEffect } from 'react';
import { X, Building, User, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { requestPayout } from '@/app/actions/wallet';

interface WithdrawalModalProps {
    userId: string;
    onClose: () => void;
    onSuccess: (newBalance: number) => void;
}

export function WithdrawalModal({ userId, onClose, onSuccess }: WithdrawalModalProps) {
    const [amount, setAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (accountNumber.length === 10 && bankName) {
            const verifyAccount = async () => {
                setVerifying(true);
                setAccountName('');
                try {
                    const { verifyBankAccountName } = await import('@/app/actions/opay');
                    const res = await verifyBankAccountName(accountNumber, bankName);
                    if (res.success && res.accountName) {
                        setAccountName(res.accountName);
                    } else {
                        toast.error(res.error || "Failed to resolve account name");
                    }
                } catch (e) {
                    toast.error("Error verifying account");
                } finally {
                    setVerifying(false);
                }
            };
            verifyAccount();
        } else if (accountNumber.length < 10) {
            setAccountName('');
        }
    }, [accountNumber, bankName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await requestPayout({
                amount: Number(amount),
                bankName,
                accountNumber
            });

            if (res.error) throw new Error(res.error);

            toast.success('Withdrawal requested successfully!');
            onSuccess(res.newBalance || 0);
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 relative transform scale-100 transition-transform duration-300">
                
                <div className="p-6 md:p-5 flex flex-col items-center border-b border-gray-100 dark:border-white/5 relative bg-neutral-50 dark:bg-neutral-900/50">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/50 dark:bg-neutral-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-16 bg-[#BEF264]/20 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl font-black text-[#BEF264]">₦</span>
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
                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Amount (₦)</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-gray-400 w-5 h-5 flex items-center justify-center font-black text-lg">₦</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                                    required
                                    min="100"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Bank Name</label>
                            <div className="relative flex items-center">
                                <Building className="absolute left-4 text-gray-400 w-5 h-5" />
                                <select
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all appearance-none"
                                    required
                                >
                                    <option value="" disabled>Select Bank</option>
                                    {['OPay', 'Moniepoint', 'GTBank', 'Access Bank', 'First Bank', 'Kuda'].map(bank => (
                                        <option key={bank} value={bank}>{bank}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Number</label>
                            <div className="relative flex items-center">
                                <Hash className="absolute left-4 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="10-digit number"
                                    className="w-full bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Name</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-4 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={accountName}
                                    readOnly={true}
                                    placeholder={verifying ? 'Verifying account details...' : 'Auto-filled upon verification'}
                                    className="w-full bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all opacity-80 cursor-not-allowed"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs py-5 rounded-2xl hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? 'Processing...' : 'Confirm Withdrawal'}
                    </button>
                </form>
            </div>
        </div>
    );
}
