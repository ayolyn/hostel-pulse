"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WalletOverviewCards } from '@/components/shared/WalletOverviewCards';
import { WithdrawalModal } from '@/components/dashboard/WithdrawalModal';
import { FundWalletModal } from '@/components/dashboard/FundWalletModal';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    History,
    ShieldCheck,
    Banknote,
    Receipt,
    ChevronRight,
    AlertCircle,
    Info,
    CreditCard,
    MessageCircle
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
    id: string;
    amount: number;
    agency_fee: number;
    inspection_fee: number;
    status: string;
    created_at: string;
    student_name: string;
    dispute_status?: string;
    buyer_id?: string;
    type?: string;
}

interface WalletTabProps {
    userId: string;
    agentAccount: any;
}

export default function WalletTab({ userId, agentAccount }: WalletTabProps) {
    const supabase = createClient();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [localBalance, setLocalBalance] = useState(Number(agentAccount?.wallet_balance || 0));
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    useEffect(() => {
        async function fetchWalletData() {
            // Pulse Reset
            window.dispatchEvent(new CustomEvent('reset-pulse', { detail: { type: 'WALLET' } }));

            setLoading(true);
            try {
                // Fetch updated profile balance. Handle single() throwing when row is missing or RLS blocked.
                try {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('wallet_balance')
                        .eq('id', userId)
                        .single();
                    
                    if (profileError) {
                        console.warn("Wallet profile fetch error (possible RLS or missing profile):", profileError);
                    } else if (profile) {
                        setLocalBalance(Number(profile.wallet_balance || 0));
                    }
                } catch (e) {
                    console.warn("Unexpected error fetching wallet balance:", e);
                }

                const [escrowRes, withdrawRes] = await Promise.all([
                    supabase
                        .from('escrow_transactions')
                        .select(`
                            id, amount, agency_fee, inspection_fee, status, created_at, dispute_status, type, payer_id,
                            profiles!payer_id (full_name)
                        `)
                        .eq('payee_id', userId)
                        .order('created_at', { ascending: false }),
                    supabase
                        .from('withdrawals')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                ]);

                if (escrowRes.error) {
                    console.error("Escrow transactions fetch error:", escrowRes.error);
                }
                if (withdrawRes.error) {
                    console.error("Withdrawals fetch error:", withdrawRes.error);
                }

                const escrowData = escrowRes.data || [];
                const formattedEscrow = escrowData.map((t: any) => ({
                    id: t.id,
                    amount: (t.type === 'INSPECTION_FEE' || t.inspection_fee > 0) ? (t.amount || t.inspection_fee) : t.amount,
                    agency_fee: t.agency_fee || 0,
                    inspection_fee: t.inspection_fee || 0,
                    status: t.status,
                    created_at: t.created_at,
                    dispute_status: t.dispute_status,
                    type: (t.type === 'INSPECTION_FEE' || t.inspection_fee > 0) ? 'Inspection' : 'Rent',
                    student_name: t.profiles?.full_name || 'Anonymous Student',
                    buyer_id: t.payer_id
                }));

                const withdrawData = withdrawRes.data || [];
                const formattedWithdrawals = withdrawData.map((w: any) => ({
                    id: w.id,
                    amount: -Number(w.amount), // Negative to indicate withdrawal
                    agency_fee: 0,
                    inspection_fee: 0,
                    status: w.status,
                    created_at: w.created_at,
                    type: 'Withdrawal',
                    student_name: 'Bank Payout',
                }));

                const combined = [...formattedEscrow, ...formattedWithdrawals].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setTransactions(combined);
            } catch (err) {
                console.error("Unexpected error fetching wallet data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchWalletData();

        const channel = supabase.channel('wallet-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, () => {
                fetchWalletData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'escrow_transactions', filter: `payee_id=eq.${userId}` }, () => {
                fetchWalletData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase]);

    const pendingEscrow = transactions
        .filter(t => t.status === 'Held' || t.status === 'pending')
        .reduce((sum, t) => sum + (t.amount + t.agency_fee), 0);

    const totalEarnings = transactions
        .filter(t => {
            const status = t.status?.toUpperCase();
            return status === 'RELEASED' || status === 'COMPLETED';
        })
        .reduce((sum, t) => sum + (t.amount + t.agency_fee), 0);

    const availableBalance = localBalance;

    const handlePayoutSuccess = (newBalance: number) => {
        setLocalBalance(newBalance);
        setShowWithdrawModal(false);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl border border-white/5" />)}
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-32">
            {/* Balance Overview */}
            <WalletOverviewCards 
                availableBalance={availableBalance} 
                escrowBalance={pendingEscrow} 
                totalVolume={totalEarnings} 
                role={typeof window !== 'undefined' && window.location.pathname.includes('student') ? 'buyer' : 'seller'}
                onWithdraw={() => setShowWithdrawModal(true)}
                onFund={() => setShowFundModal(true)}
            />

            {/* Transaction Ledger */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-xs text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-[#0D9488] dark:text-[#BEF264]" />
                        Transaction History
                    </h2>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{transactions.length} Total</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-20 text-center">
                        <Wallet className="w-16 h-16 text-gray-200 dark:text-white/5 mx-auto mb-6" />
                        <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Your Wallet is Empty</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 px-10">Start listing properties in Under-G to earn your first commission!</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {transactions.map((tx) => {
                                const isHeld = tx.status === 'Held' || tx.status === 'pending';
                                const isReleased = tx.status === 'Released' || tx.status === 'completed';
                                const isRefunded = tx.status === 'Refunded';
                                const isDisputed = tx.dispute_status === 'OPEN';

                                return (
                                    <div 
                                        key={tx.id} 
                                        onClick={() => setSelectedTx(tx)}
                                        className="py-2 px-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-between group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${isDisputed ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500' : tx.type === 'Withdrawal' ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500' : isHeld ? 'bg-amber-50 dark:bg-amber-400/10 border-amber-100 dark:border-amber-400/20 text-amber-500 dark:text-amber-400' : isReleased ? 'bg-emerald-50 dark:bg-[#BEF264]/10 border-emerald-100 dark:border-[#BEF264]/20 text-[#0D9488] dark:text-[#BEF264]' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                                {tx.type === 'Withdrawal' ? <ArrowUpRight className="w-4 h-4" /> : isReleased ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-xs text-gray-900 dark:text-white uppercase tracking-tight">{tx.type} Payment</h4>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-1">Paid by {tx.student_name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-base font-black ${isRefunded ? 'text-red-500 line-through' : 'text-gray-900 dark:text-white'}`}>₦{tx.amount.toLocaleString()}</p>
                                            <div className="flex items-center justify-end gap-2 mt-1">
                                                {isDisputed ? (
                                                    <div className="group/tooltip relative">
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 cursor-help">
                                                            FROZEN / DISPUTED
                                                        </span>
                                                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-red-500/20 text-gray-700 dark:text-red-400 text-[9px] rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-10 text-left">
                                                            The buyer has reported an issue. An admin is reviewing this transaction.
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isHeld ? 'bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400' : isReleased ? 'bg-emerald-100 dark:bg-[#BEF264]/10 text-emerald-600 dark:text-[#BEF264]' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                                                        {tx.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* Payout Modal */}
            {showWithdrawModal && (
                <WithdrawalModal 
                    userId={userId} 
                    onClose={() => setShowWithdrawModal(false)}
                    onSuccess={handlePayoutSuccess}
                />
            )}

            {showFundModal && (
                <FundWalletModal 
                    userId={userId} 
                    onClose={() => setShowFundModal(false)}
                />
            )}

            {/* Transaction Details Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md p-5 relative shadow-2xl overflow-hidden">
                        <button 
                            onClick={() => setSelectedTx(null)}
                            className="absolute top-4 right-6 w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <XCircle className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Receipt className="w-8 h-8 text-[#0D9488] dark:text-[#BEF264]" />
                            </div>
                            <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Transaction Details</h3>
                            <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{selectedTx.type} Payment</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Transaction ID</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedTx.id.split('-')[0]}...</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Date</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{new Date(selectedTx.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Buyer</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedTx.student_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Amount</span>
                                <span className="text-base font-black text-gray-900 dark:text-white">₦{selectedTx.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Status</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${selectedTx.status === 'Held' || selectedTx.status === 'pending' ? 'bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400' : selectedTx.status === 'Released' || selectedTx.status === 'completed' ? 'bg-emerald-100 dark:bg-[#BEF264]/10 text-emerald-600 dark:text-[#BEF264]' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                                    {selectedTx.status}
                                </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 mt-4 flex-wrap">
                                {selectedTx.buyer_id && (
                                    <Link 
                                        href={`/dashboard/agent?tab=messages&userId=${selectedTx.buyer_id}`}
                                        className="flex-1 bg-blue-500 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[9px] hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" /> Message Buyer
                                    </Link>
                                )}
                                <button 
                                    onClick={() => setSelectedTx(null)}
                                    className="flex-1 bg-black dark:bg-white text-white dark:text-black font-black py-3 rounded-xl uppercase tracking-widest text-[9px] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Loader2 = (props: any) => (
    <svg 
        {...props} 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
);
