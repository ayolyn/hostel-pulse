"use client";

import React, { useState, useEffect } from 'react';
import { 
    Banknote, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Copy, 
    Check, 
    Search, 
    RefreshCcw, 
    AlertCircle, 
    ShieldCheck, 
    User,
    Building2,
    Hash,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPayoutRequests, approveWithdrawal, rejectWithdrawal } from '@/app/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/actions';

interface PayoutRequest {
    id: string;
    user_id: string;
    amount: number;
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    flw_reference: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED';
    failure_reason?: string;
    admin_notes?: string;
    approved_by?: string;
    approved_at?: string;
    created_at: string;
    profile?: {
        id: string;
        full_name?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        contact_email?: string;
        phone?: string;
        phone_number?: string;
        role?: string;
        avatar_url?: string;
    } | null;
}

export function PayoutRequestsTab() {
    const [requests, setRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SUCCESSFUL' | 'REJECTED'>('ALL');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Modal states
    const [approveModalItem, setApproveModalItem] = useState<PayoutRequest | null>(null);
    const [adminNoteInput, setAdminNoteInput] = useState('');
    const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);

    const [rejectModalItem, setRejectModalItem] = useState<PayoutRequest | null>(null);
    const [rejectionReasonInput, setRejectionReasonInput] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    const fetchRequests = async () => {
        try {
            const data = await getPayoutRequests();
            setRequests(data as PayoutRequest[]);
        } catch (err: any) {
            console.error('Failed to load payouts:', err);
            toast.error(err.message || 'Could not load payouts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success(`Copied ${text} to clipboard!`);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const handleConfirmApprove = async () => {
        if (!approveModalItem) return;
        setIsSubmittingApprove(true);
        try {
            const res = await approveWithdrawal(approveModalItem.id, adminNoteInput.trim() || undefined);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Payout marked as Paid & Approved!');
                setApproveModalItem(null);
                setAdminNoteInput('');
                await fetchRequests();
            }
        } catch (err: any) {
            toast.error(err.message || 'Approval failed');
        } finally {
            setIsSubmittingApprove(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectModalItem) return;
        if (!rejectionReasonInput.trim()) {
            toast.error('Please enter a rejection reason.');
            return;
        }
        setIsSubmittingReject(true);
        try {
            const res = await rejectWithdrawal(rejectModalItem.id, rejectionReasonInput.trim());
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Payout rejected. Funds refunded to wallet!');
                setRejectModalItem(null);
                setRejectionReasonInput('');
                await fetchRequests();
            }
        } catch (err: any) {
            toast.error(err.message || 'Rejection failed');
        } finally {
            setIsSubmittingReject(false);
        }
    };

    // Metrics calculations
    const pendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING');
    const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const successfulRequests = requests.filter(r => r.status === 'SUCCESSFUL');
    const totalDisbursedAmount = successfulRequests.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const rejectedRequests = requests.filter(r => r.status === 'REJECTED' || r.status === 'FAILED');
    const totalRejectedAmount = rejectedRequests.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // Filtering
    const filteredRequests = requests.filter(req => {
        const matchesStatus = 
            statusFilter === 'ALL' ? true :
            statusFilter === 'PENDING' ? (req.status === 'PENDING' || req.status === 'PROCESSING') :
            statusFilter === 'SUCCESSFUL' ? (req.status === 'SUCCESSFUL') :
            (req.status === 'REJECTED' || req.status === 'FAILED');

        const term = searchTerm.toLowerCase().trim();
        if (!term) return matchesStatus;

        const userName = (req.profile?.full_name || `${req.profile?.first_name || ''} ${req.profile?.last_name || ''}`).toLowerCase();
        const userEmail = (req.profile?.email || req.profile?.contact_email || '').toLowerCase();
        const accountNum = (req.account_number || '').toLowerCase();
        const accountName = (req.account_name || '').toLowerCase();
        const bankName = (req.bank_name || '').toLowerCase();
        const ref = (req.flw_reference || '').toLowerCase();

        const matchesSearch = 
            userName.includes(term) ||
            userEmail.includes(term) ||
            accountNum.includes(term) ||
            accountName.includes(term) ||
            bankName.includes(term) ||
            ref.includes(term);

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#BEF264] flex items-center gap-3">
                        <Banknote className="w-7 h-7 text-[#BEF264]" />
                        Payout Approvals HQ
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Review requested withdrawals, disburse funds to recipient bank accounts, and finalize or refund transactions.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="self-start sm:self-auto flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#BEF264]' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#1e293b] rounded-3xl p-5 border border-amber-500/20 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Pending Review</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    </div>
                    <div className="text-2xl font-black text-white mt-3">
                        ₦{totalPendingAmount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-amber-300/80 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {pendingRequests.length} {pendingRequests.length === 1 ? 'request' : 'requests'} awaiting action
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-3xl p-5 border border-emerald-500/20 shadow-xl">
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Total Paid & Disbursed</span>
                    <div className="text-2xl font-black text-[#BEF264] mt-3">
                        ₦{totalDisbursedAmount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-emerald-400/80 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {successfulRequests.length} completed payouts
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-3xl p-5 border border-red-500/20 shadow-xl">
                    <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">Rejected / Refunded</span>
                    <div className="text-2xl font-black text-red-400 mt-3">
                        ₦{totalRejectedAmount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-red-400/80 font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        {rejectedRequests.length} refunded requests
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#1e293b] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {(['ALL', 'PENDING', 'SUCCESSFUL', 'REJECTED'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                statusFilter === tab
                                    ? 'bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/10'
                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {tab === 'ALL' ? 'All Requests' :
                             tab === 'PENDING' ? `Pending (${pendingRequests.length})` :
                             tab === 'SUCCESSFUL' ? 'Paid' : 'Rejected'}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 md:max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search Name, Account, Bank, Reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#BEF264]/50 outline-none"
                    />
                </div>
            </div>

            {/* Payout Requests List */}
            {loading ? (
                <div className="bg-[#1e293b] rounded-3xl p-12 border border-white/5 text-center shadow-xl">
                    <Clock className="w-12 h-12 text-[#BEF264]/50 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-white">Loading Payout Requests...</h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Syncing with database</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-[#1e293b] rounded-3xl p-16 border border-white/5 text-center shadow-xl">
                    <Banknote className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                    <h3 className="text-base font-black uppercase tracking-widest text-white">No Payout Requests Found</h3>
                    <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto font-medium">
                        {searchTerm ? 'No results matched your search query. Try clearing the filter.' : 'There are currently no withdrawal requests in this category.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5">
                    {filteredRequests.map(req => {
                        const isPending = req.status === 'PENDING' || req.status === 'PROCESSING';
                        const isSuccessful = req.status === 'SUCCESSFUL';
                        const isRejected = req.status === 'REJECTED' || req.status === 'FAILED';

                        const userName = req.profile?.full_name || 
                            (req.profile?.first_name ? `${req.profile.first_name} ${req.profile.last_name || ''}` : req.account_name) || 
                            'HostelPulse User';
                        const userRole = (req.profile?.role || 'User').toLowerCase();
                        const userEmail = req.profile?.email || req.profile?.contact_email || 'No email';
                        const userPhone = req.profile?.phone || req.profile?.phone_number;

                        return (
                            <div 
                                key={req.id} 
                                className={`bg-[#1e293b] rounded-[2rem] p-6 border transition-all duration-200 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${
                                    isPending ? 'border-amber-500/30 hover:border-amber-500/60 bg-gradient-to-r from-[#1e293b] to-amber-950/10' :
                                    isSuccessful ? 'border-emerald-500/20 hover:border-emerald-500/40' :
                                    'border-red-500/20 hover:border-red-500/40'
                                }`}
                            >
                                {/* Left Section: User & Amount Info */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                                    <div className="relative w-14 h-14 bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
                                        {req.profile?.avatar_url ? (
                                            <img src={req.profile.avatar_url} alt={userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-[#BEF264] opacity-60 w-6 h-6" />
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-widest ${
                                                userRole === 'agent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                                userRole === 'landlord' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            }`}>
                                                {userRole}
                                            </span>

                                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-widest border ${
                                                isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' :
                                                isSuccessful ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                'bg-red-500/10 text-red-400 border-red-500/30'
                                            }`}>
                                                {req.status}
                                            </span>

                                            <span className="text-[10px] text-gray-500 font-mono">
                                                Ref: {req.flw_reference || req.id.slice(0, 8)}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                                            {userName}
                                        </h3>

                                        <p className="text-xs text-gray-400 font-medium">
                                            {userEmail} {userPhone && `• ${userPhone}`}
                                        </p>

                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-1">
                                            Requested: {new Date(req.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Center Section: Bank Account Details with 1-Click Copy */}
                                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 w-full lg:w-auto min-w-[280px] space-y-2">
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-widest text-[#BEF264]">
                                            <Building2 className="w-3.5 h-3.5" />
                                            {req.bank_name || 'Bank'}
                                        </span>
                                        <span className="text-[9px] font-mono text-gray-500">Code: {req.bank_code}</span>
                                    </div>

                                    {/* Account Number with Quick Copy */}
                                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                        <span className="text-base font-black font-mono tracking-wider text-white">
                                            {req.account_number}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(req.account_number, req.id)}
                                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-[#BEF264]/20 hover:bg-[#BEF264]/30 text-[#BEF264] px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                                            title="Copy Account Number"
                                        >
                                            {copiedId === req.id ? (
                                                <>
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Verified Account Name */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium truncate">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span className="truncate">{req.account_name}</span>
                                    </div>
                                </div>

                                {/* Right Section: Amount & Action Buttons */}
                                <div className="flex flex-col items-start lg:items-end justify-between gap-4 w-full lg:w-auto shrink-0">
                                    <div className="text-left lg:text-right">
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Payout Amount</span>
                                        <div className="text-2xl font-black text-[#BEF264]">
                                            ₦{Number(req.amount).toLocaleString()}
                                        </div>
                                    </div>

                                    {isPending ? (
                                        <div className="flex items-center gap-2 w-full lg:w-auto">
                                            <button
                                                onClick={() => {
                                                    setApproveModalItem(req);
                                                    setAdminNoteInput('');
                                                }}
                                                className="flex-1 lg:flex-none bg-[#BEF264] hover:bg-[#d9ff96] text-black text-xs font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-lg shadow-[#BEF264]/10 active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Approve & Mark Paid
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setRejectModalItem(req);
                                                    setRejectionReasonInput('');
                                                }}
                                                className="flex-1 lg:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject & Refund
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-400 lg:text-right space-y-1">
                                            {req.approved_at && (
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    Paid: {new Date(req.approved_at).toLocaleDateString()}
                                                </p>
                                            )}
                                            {req.admin_notes && (
                                                <p className="text-[11px] text-gray-300 italic max-w-xs truncate">
                                                    Note: "{req.admin_notes}"
                                                </p>
                                            )}
                                            {req.failure_reason && (
                                                <p className="text-[11px] text-red-400 italic max-w-xs truncate">
                                                    Reason: "{req.failure_reason}"
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Approve Payout Modal */}
            {approveModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1e293b] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-[#BEF264]/20 border border-[#BEF264]/30 flex items-center justify-center mx-auto text-[#BEF264]">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                Confirm Payout Disbursal
                            </h3>
                            <p className="text-xs text-gray-400 font-medium">
                                Have you transferred <strong>₦{Number(approveModalItem.amount).toLocaleString()}</strong> to <strong>{approveModalItem.account_name}</strong>?
                            </p>
                        </div>

                        {/* Summary details */}
                        <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-gray-400 font-bold uppercase text-[10px]">Bank</span>
                                <span className="text-white font-bold">{approveModalItem.bank_name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-gray-400 font-bold uppercase text-[10px]">Account Number</span>
                                <span className="text-white font-mono font-bold">{approveModalItem.account_number}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-gray-400 font-bold uppercase text-[10px]">Amount</span>
                                <span className="text-[#BEF264] font-black text-sm">₦{Number(approveModalItem.amount).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                Payment Reference / Notes (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Bank Session ID, Transfer Ref, or Note"
                                value={adminNoteInput}
                                onChange={(e) => setAdminNoteInput(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#BEF264]/50 outline-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setApproveModalItem(null)}
                                disabled={isSubmittingApprove}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-black uppercase tracking-widest text-xs py-3 rounded-xl transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmApprove}
                                disabled={isSubmittingApprove}
                                className="flex-1 bg-[#BEF264] hover:bg-[#d9ff96] text-black font-black uppercase tracking-widest text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {isSubmittingApprove ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {isSubmittingApprove ? 'Finalizing...' : 'Yes, Confirm Paid'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject & Refund Modal */}
            {rejectModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1e293b] border border-red-500/30 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                Reject & Refund Payout
                            </h3>
                            <p className="text-xs text-gray-400 font-medium">
                                This will reject the payout request of <strong>₦{Number(rejectModalItem.amount).toLocaleString()}</strong> and atomically refund the funds back to the user's wallet.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                Rejection Reason (Required - Sent to User)
                            </label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Account name mismatch with KYC, invalid account number, or bank network error..."
                                value={rejectionReasonInput}
                                onChange={(e) => setRejectionReasonInput(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-red-500/50 outline-none resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setRejectModalItem(null)}
                                disabled={isSubmittingReject}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-black uppercase tracking-widest text-xs py-3 rounded-xl transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                disabled={isSubmittingReject || !rejectionReasonInput.trim()}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {isSubmittingReject ? <Clock className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                {isSubmittingReject ? 'Refunding...' : 'Confirm & Refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
