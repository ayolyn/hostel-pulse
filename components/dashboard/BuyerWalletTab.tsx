"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { WalletOverviewCards } from '@/components/shared/WalletOverviewCards';
import { DepositModal } from '@/components/dashboard/DepositModal';
import { WithdrawalModal } from '@/components/dashboard/WithdrawalModal';
import { toast } from 'react-hot-toast';
import { releaseEscrowFunds, initiateEscrowDispute, cancelAndRefundOrder } from '@/app/actions/escrow';
import { 
    Wallet, 
    ArrowUpRight, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    X,
    History,
    ShieldCheck,
    Receipt,
    CreditCard,
    AlertCircle,
    Building,
    Building2,
    Package,
    PlusCircle,
    Star,
    MessageCircle
} from 'lucide-react';
import { ReviewModal } from '@/components/reviews/ReviewModal';

interface Transaction {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    type: 'Property' | 'Market' | 'Withdrawal' | 'Deposit' | 'Sale' | 'Inspection';
    title: string;
    bankName?: string;
    accountNumber?: string;
    dispute_status?: string;
    dispute_reason?: string;
    payee_id?: string;
    payee_name?: string;
}

export default function BuyerWalletTab({ userId }: { userId: string }) {
    const supabase = createClient();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [releasingTx, setReleasingTx] = useState<string | null>(null);
    const [cancellingTx, setCancellingTx] = useState<string | null>(null);
    const [disputeModal, setDisputeModal] = useState<{ id: string | null, reason: string }>({ id: null, reason: '' });
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [reviewModalProvider, setReviewModalProvider] = useState<{ id: string, name: string } | null>(null);

    const handleCancelOrder = async (transactionId: string) => {
        if (!window.confirm("Are you sure you want to cancel this order? Your funds will be returned to your wallet.")) {
            return;
        }

        setCancellingTx(transactionId);
        try {
            const res = await cancelAndRefundOrder(transactionId);
            if (res.error) throw new Error(res.error);
            toast.success('Order cancelled. Funds have been refunded to the buyer!');
            setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'refunded' } : t));
            
            // Re-fetch balance to reflect any local changes (though seller balance doesn't change here)
            const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
            if (profile) setCurrentBalance(Number(profile.wallet_balance || 0));
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setCancellingTx(null);
        }
    };

    const handleConfirmDelivery = async (transactionId: string) => {
        setReleasingTx(transactionId);
        try {
            const res = await releaseEscrowFunds(transactionId);
            if (res.error) throw new Error(res.error);
            toast.success('Payment released to seller!');
            setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'completed' } : t));
            
            // Re-fetch balance
            const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
            if (profile) setCurrentBalance(Number(profile.wallet_balance || 0));
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setReleasingTx(null);
        }
    };

    const handleDispute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!disputeModal.id || !disputeModal.reason.trim()) return;

        try {
            const res = await initiateEscrowDispute(disputeModal.id, disputeModal.reason);
            if (res.error) throw new Error(res.error);
            toast.success('Funds frozen. Admin has been notified.');
            setTransactions(prev => prev.map(t => t.id === disputeModal.id ? { ...t, status: 'Disputed', dispute_status: 'OPEN', dispute_reason: disputeModal.reason } : t));
            setDisputeModal({ id: null, reason: '' });
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        async function fetchWalletData() {
            setLoading(true);
            try {
                // Fetch current user wallet balance
                try {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('wallet_balance')
                        .eq('id', userId)
                        .single();
                        
                    if (profileError) {
                        console.warn("Buyer wallet profile fetch error (possible RLS):", profileError);
                    } else if (profile) {
                        setCurrentBalance(Number(profile.wallet_balance || 0));
                    }
                } catch (e) {
                    console.warn("Unexpected error fetching buyer wallet balance:", e);
                }

                const escrowPromise = supabase
                    .from('escrow_transactions')
                    .select(`
                        id, amount, status, created_at, payer_id, payee_id, dispute_status, dispute_reason, type,
                        properties!property_id (title),
                        market_listings!listing_id (title),
                        profiles!payee_id (full_name)
                    `)
                    .or(`payer_id.eq.${userId},payee_id.eq.${userId}`);

                const withdrawPromise = supabase
                    .from('withdrawals')
                    .select('*')
                    .eq('user_id', userId);

                const depositPromise = supabase
                    .from('deposits')
                    .select('*')
                    .eq('user_id', userId);

                const [escrowRes, withdrawRes, depositRes] = await Promise.all([escrowPromise, withdrawPromise, depositPromise]);

                if (escrowRes.error) console.error("Escrow fetch error:", escrowRes.error);
                if (withdrawRes.error) console.error("Withdrawals fetch error:", withdrawRes.error);
                if (depositRes.error) console.error("Deposits fetch error:", depositRes.error);

                const escrowFormatted = (escrowRes.data || []).map((t: any) => {
                    const isSale = t.payee_id === userId;
                    const isInspection = t.type === 'INSPECTION_FEE';
                    return {
                        id: t.id,
                        amount: isSale ? Number(t.amount) : -Number(t.amount), // Negative if they are the payer
                        status: t.status,
                        created_at: t.created_at,
                        type: isSale ? 'Sale' : (isInspection ? 'Inspection' : (t.properties ? 'Property' : 'Market')),
                        title: isSale ? 'Sale' : (isInspection ? 'Inspection Fee' : (t.properties?.title || t.market_listings?.title || 'Payment')),
                        dispute_status: t.dispute_status,
                        dispute_reason: t.dispute_reason,
                        payee_id: t.payee_id,
                        payee_name: t.profiles?.full_name || 'Provider'
                    };
                });

                const withdrawFormatted = (withdrawRes.data || []).map((w: any) => ({
                    id: w.id,
                    amount: -Number(w.amount), // Negative to indicate withdrawal
                    status: w.status,
                    created_at: w.created_at,
                    type: 'Withdrawal',
                    title: 'Withdrawal to Bank',
                    bankName: w.bank_name,
                    accountNumber: w.account_number
                }));

                const depositFormatted = (depositRes.data || []).map((d: any) => ({
                    id: d.id,
                    amount: Number(d.amount), // Positive to indicate deposit
                    status: d.status,
                    created_at: d.created_at,
                    type: 'Deposit',
                    title: 'Wallet Deposit'
                }));

                const combined = [...escrowFormatted, ...withdrawFormatted, ...depositFormatted].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setTransactions(combined as Transaction[]);
            } catch (err) {
                console.error("Error fetching wallet data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchWalletData();
    }, [userId, supabase]);

    const escrowBalance = transactions
        .filter(t => (t.status === 'Held' || t.status === 'Locked' || t.status === 'pending' || t.status === 'Pending') && t.type !== 'Withdrawal')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const totalSpent = transactions
        .filter(t => {
            const status = t.status?.toUpperCase();
            const isPurchase = t.type !== 'Deposit' && t.type !== 'Withdrawal' && t.amount < 0;
            return (status === 'RELEASED' || status === 'COMPLETED' || status === 'HELD') && isPurchase;
        })
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const escrowTransactions = transactions.filter(t => ['Held', 'Locked', 'pending', 'Pending'].includes(t.status));
    const historyTransactions = transactions.filter(t => !['Held', 'Locked', 'pending', 'Pending'].includes(t.status));

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2].map(i => <div key={i} className="h-40 bg-white/5 dark:bg-neutral-900 rounded-[2rem] border border-white/5" />)}
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-32">
            {/* Balance Overview */}
            <WalletOverviewCards availableBalance={currentBalance} escrowBalance={escrowBalance} totalVolume={totalSpent} role="buyer" />

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={() => setShowDepositModal(true)}
                    className="flex-1 bg-[#BEF264] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20"
                >
                    Deposit Funds
                </button>
                <button 
                    onClick={() => setShowWithdrawalModal(true)}
                    className="flex-1 bg-neutral-900 dark:bg-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all border border-neutral-800 dark:border-white/5"
                >
                    Withdraw
                </button>
            </div>

            {/* Escrow Operations */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-[#BEF264]" />
                        Escrow Operations
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{escrowTransactions.length} Pending</span>
                </div>

                {escrowTransactions.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] p-10 text-center">
                        <ShieldCheck className="w-12 h-12 text-gray-100 dark:text-neutral-800 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">No Active Escrows</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {escrowTransactions.map((t) => (
                            <div key={t.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between hover:border-[#BEF264]/40 transition-all group gap-4">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                        t.type === 'Property' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 
                                        t.type === 'Sale' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 
                                        'bg-purple-50 dark:bg-purple-500/10 text-purple-500'
                                    }`}>
                                        {t.type === 'Property' ? <Building2 className="w-6 h-6" /> : 
                                         t.type === 'Sale' ? <ArrowUpRight className="w-6 h-6" /> :
                                         <Package className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm line-clamp-1">{t.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-neutral-800" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:items-end gap-3">
                                    <p className="text-lg font-black tracking-tighter text-amber-500">
                                        ₦{Math.abs(t.amount).toLocaleString()}
                                    </p>
                                    
                                    {t.type === 'Sale' ? (
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                                                Awaiting Buyer Release
                                            </span>
                                            {t.dispute_status === 'OPEN' ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 mt-2">
                                                    FROZEN
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleCancelOrder(t.id)}
                                                    disabled={cancellingTx === t.id}
                                                    className="bg-transparent border border-red-500 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center min-w-[120px] mt-2"
                                                >
                                                    {cancellingTx === t.id ? 'Cancelling...' : 'Cancel & Refund'}
                                                </button>
                                            )}
                                        </div>
                                    ) : t.type === 'Withdrawal' ? (
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-white/5">
                                                {t.status === 'pending' || t.status === 'Pending' ? 'Pending Admin Approval' : t.status}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <button 
                                                onClick={() => handleConfirmDelivery(t.id)}
                                                disabled={releasingTx === t.id || t.dispute_status === 'OPEN'}
                                                className="bg-[#BEF264] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#a6d456] transition-all flex items-center justify-center min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {releasingTx === t.id ? 'Processing...' : (t.type === 'Property' ? 'MARK AS COMPLETE' : 'Confirm Delivery')}
                                            </button>
                                            
                                            {t.dispute_status === 'OPEN' ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center">
                                                    FROZEN (Dispute Open)
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => setDisputeModal({ id: t.id, reason: '' })}
                                                    disabled={releasingTx === t.id}
                                                    className="bg-transparent border border-red-500 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center"
                                                >
                                                    Report Issue / Freeze Funds
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Transaction Ledger */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-[#BEF264]" />
                        Payment History
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{historyTransactions.length} Total</span>
                </div>

                {historyTransactions.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] p-20 text-center">
                        <Wallet className="w-16 h-16 text-gray-100 dark:text-neutral-800 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No Transactions Yet</h3>
                        <p className="text-gray-500 mt-2 font-medium">When you pay for a hostel or market item, it will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {historyTransactions.map((t) => (
                            <div key={t.id} onClick={() => setSelectedTx(t)} className="cursor-pointer bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 p-6 rounded-3xl flex items-center justify-between hover:border-[#BEF264]/40 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                        t.type === 'Property' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 
                                        t.type === 'Withdrawal' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 
                                        t.type === 'Deposit' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 
                                        t.type === 'Sale' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 
                                        'bg-purple-50 dark:bg-purple-500/10 text-purple-500'
                                    }`}>
                                        {t.type === 'Property' ? <Building2 className="w-6 h-6" /> : 
                                         t.type === 'Withdrawal' ? <Building className="w-6 h-6" /> :
                                         t.type === 'Deposit' ? <PlusCircle className="w-6 h-6" /> :
                                         t.type === 'Sale' ? <ArrowUpRight className="w-6 h-6" /> :
                                         <Package className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm line-clamp-1">{t.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-neutral-800" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {t.type === 'Withdrawal' ? `${t.bankName || 'Bank'} (*${t.accountNumber?.slice(-4) || '****'})` : t.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black tracking-tighter ${
                                        t.amount < 0 ? 'text-red-500' : 
                                        (t.type === 'Deposit' || t.type === 'Sale') ? 'text-emerald-500' : 
                                        'text-gray-900 dark:text-white'
                                    }`}>
                                        {t.amount < 0 ? '- ' : (t.type === 'Deposit' || t.type === 'Sale') ? '+ ' : ''}₦{Math.abs(t.amount).toLocaleString()}
                                    </p>
                                    <div className="flex flex-col items-end gap-2 mt-1">
                                        {t.status?.toLowerCase() === 'disputed' ? (
                                            <Link href={`/dashboard/student/disputes/${t.id}`} className="flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20 cursor-pointer">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Case Room</span>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    t.status === 'completed' || t.status === 'Released' ? 'bg-emerald-500' : 
                                                    t.status === 'pending' || t.status === 'Held' || t.status === 'Locked' ? 'bg-amber-500' : 
                                                    'bg-gray-400'
                                                }`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    t.status === 'completed' || t.status === 'Released' ? 'text-emerald-500' : 
                                                    t.status === 'pending' || t.status === 'Held' || t.status === 'Locked' ? 'text-amber-500' : 
                                                    'text-gray-400'
                                                }`}>{t.status}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Dispute Modal */}
            {disputeModal.id && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 w-full max-w-md border border-gray-100 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Report Issue</h3>
                            <button 
                                onClick={() => setDisputeModal({ id: null, reason: '' })}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleDispute}>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Freezing funds will prevent the seller from accessing them while our admin team reviews your claim. Please explain the issue (e.g. "House doesn't match pictures", "Landlord unresponsive").
                            </p>
                            <textarea
                                required
                                rows={4}
                                value={disputeModal.reason}
                                onChange={(e) => setDisputeModal({ ...disputeModal, reason: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none resize-none mb-6 text-sm"
                                placeholder="Describe the issue..."
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDisputeModal({ id: null, reason: '' })}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                >
                                    Freeze Funds
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deposit Modal */}
            {showDepositModal && (
                <DepositModal 
                    userId={userId} 
                    onClose={() => setShowDepositModal(false)}
                    onSuccess={(newBalance) => {
                        setCurrentBalance(newBalance);
                        setShowDepositModal(false);
                    }}
                />
            )}

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <WithdrawalModal 
                    userId={userId} 
                    onClose={() => setShowWithdrawalModal(false)}
                    onSuccess={(newBalance) => {
                        setCurrentBalance(newBalance);
                        setShowWithdrawalModal(false);
                        window.location.reload();
                    }}
                />
            )}
            {/* Transaction Details Modal */}
            {selectedTx && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-neutral-100 dark:border-white/5">
                        <button 
                            onClick={() => setSelectedTx(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="p-8">
                            <div className="w-16 h-16 bg-[#BEF264]/20 rounded-2xl flex items-center justify-center mb-6">
                                <Receipt className="w-8 h-8 text-[#BEF264]" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-1">Transaction Details</h3>
                            <p className="text-gray-500 font-medium text-sm mb-8">Ref: {selectedTx.id}</p>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-white/5">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Amount</span>
                                    <span className="font-black text-gray-900 dark:text-white">₦{Math.abs(selectedTx.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-white/5">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Item / Purpose</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{selectedTx.title}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-white/5">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Date</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{new Date(selectedTx.created_at).toLocaleString('en-NG')}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Status</span>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                        selectedTx.status === 'completed' || selectedTx.status === 'Released' ? 'bg-emerald-50 text-emerald-700' : 
                                        selectedTx.status === 'pending' || selectedTx.status === 'Held' || selectedTx.status === 'Locked' ? 'bg-amber-50 text-amber-700' : 
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        {selectedTx.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                {selectedTx.payee_id && selectedTx.amount < 0 && (
                                    <Link 
                                        href={`/dashboard/student?tab=messages&userId=${selectedTx.payee_id}`}
                                        className="flex-1 bg-blue-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" /> Message Seller
                                    </Link>
                                )}
                                {(selectedTx.status === 'completed' || selectedTx.status === 'Released') && selectedTx.payee_id && selectedTx.amount < 0 && (
                                    <button 
                                        onClick={() => {
                                            setSelectedTx(null);
                                            setReviewModalProvider({ id: selectedTx.payee_id!, name: selectedTx.payee_name || 'Provider' });
                                        }}
                                        className="flex-1 bg-[#BEF264] text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Star className="w-4 h-4" /> Leave Review
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelectedTx(null)}
                                    className="flex-1 bg-black dark:bg-white text-white dark:text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModalProvider && (
                <ReviewModal 
                    providerId={reviewModalProvider.id} 
                    providerName={reviewModalProvider.name} 
                    onClose={() => setReviewModalProvider(null)} 
                />
            )}
        </div>
    );
}
