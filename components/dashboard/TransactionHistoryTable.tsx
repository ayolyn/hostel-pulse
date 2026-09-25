"use client";

import { useState } from "react";
import { Receipt, XCircle, ArrowUpRight, MessageCircle } from "lucide-react";

interface PayoutRequest {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    account_name: string;
    bank_name: string;
    failure_reason?: string;
}

interface TransactionHistoryTableProps {
    transactions: PayoutRequest[];
}

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
    const [selectedTx, setSelectedTx] = useState<PayoutRequest | null>(null);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-xs text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-[#0D9488] dark:text-[#BEF264]" />
                    Withdrawal History
                </h2>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{transactions.length} Total</span>
            </div>

            {transactions.length === 0 ? (
                <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-20 text-center">
                    <Receipt className="w-16 h-16 text-gray-200 dark:text-white/5 mx-auto mb-6" />
                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">No Withdrawals Yet</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 px-10">Your withdrawal history will appear here.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {transactions.map((tx) => {
                            const isProcessing = tx.status === 'PROCESSING' || tx.status === 'PENDING';
                            const isSuccess = tx.status === 'SUCCESSFUL';
                            const isFailed = tx.status === 'FAILED';

                            return (
                                <div 
                                    key={tx.id} 
                                    onClick={() => setSelectedTx(tx)}
                                    className="py-3 px-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-between group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isFailed ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500' : isProcessing ? 'bg-amber-50 dark:bg-amber-400/10 border-amber-100 dark:border-amber-400/20 text-amber-500 dark:text-amber-400' : 'bg-emerald-50 dark:bg-[#BEF264]/10 border-emerald-100 dark:border-[#BEF264]/20 text-[#0D9488] dark:text-[#BEF264]'}`}>
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Bank Payout</h4>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">{tx.bank_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">₦{tx.amount.toLocaleString()}</p>
                                        <div className="mt-1">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isProcessing ? 'bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400' : isSuccess ? 'bg-emerald-100 dark:bg-[#BEF264]/10 text-emerald-600 dark:text-[#BEF264]' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md p-6 relative shadow-2xl overflow-hidden">
                        <button 
                            onClick={() => setSelectedTx(null)}
                            className="absolute top-4 right-6 w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <XCircle className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt className="w-8 h-8 text-[#0D9488] dark:text-[#BEF264]" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Withdrawal Receipt</h3>
                            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{new Date(selectedTx.created_at).toLocaleString()}</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Transaction ID</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedTx.id.split('-')[0]}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Recipient Name</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white text-right max-w-[60%]">{selectedTx.account_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Bank Name</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedTx.bank_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Amount</span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">₦{selectedTx.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Status</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedTx.status === 'PROCESSING' || selectedTx.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400' : selectedTx.status === 'SUCCESSFUL' ? 'bg-emerald-100 dark:bg-[#BEF264]/10 text-emerald-600 dark:text-[#BEF264]' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                                    {selectedTx.status}
                                </span>
                            </div>
                            {selectedTx.failure_reason && (
                                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
                                    <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Reason for Failure</p>
                                    <p className="text-xs font-bold text-red-800 dark:text-red-300">{selectedTx.failure_reason}</p>
                                </div>
                            )}
                            
                            <div className="mt-6">
                                <button 
                                    onClick={() => setSelectedTx(null)}
                                    className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-3 rounded-xl uppercase tracking-widest text-[10px] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
