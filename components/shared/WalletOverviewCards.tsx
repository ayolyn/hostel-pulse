import React from 'react';
import { Wallet, Clock, History, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';

interface WalletOverviewCardsProps {
    availableBalance: number;
    escrowBalance: number;
    totalVolume: number;
    role: 'buyer' | 'seller';
    onWithdraw?: () => void;
    onFund?: () => void;
}

export function WalletOverviewCards({ availableBalance, escrowBalance, totalVolume, role, onWithdraw, onFund }: WalletOverviewCardsProps) {
    const isBuyer = role === 'buyer';

    const cards = isBuyer ? [
        { label: 'Available Balance', val: availableBalance, icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', isMain: true, actionType: 'fund' as const },
        { label: 'Total Spent', val: totalVolume, icon: CheckCircle2, color: 'text-[#BEF264]', bg: 'bg-[#BEF264]/10' },
    ] : [
        { label: 'Available Payout', val: availableBalance, icon: ShieldCheck, color: 'text-[#BEF264]', bg: 'bg-[#BEF264]/10', isMain: true, actionType: 'withdraw' as const },
        { label: 'Total Earned', val: totalVolume, icon: History, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, i) => (
                <div key={i} className={`bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 p-5 rounded-3xl flex flex-col justify-between group hover:shadow-xl transition-all ${card.isMain ? 'border-[#BEF264]/40 border-2' : ''}`}>
                    <div className="flex justify-between items-start">
                        <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                        {card.isMain && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-black bg-[#BEF264] px-3 py-1 rounded-full shadow-lg">Main Balance</span>
                        )}
                    </div>
                    <div className="mt-4">
                        <p className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center justify-between gap-4 flex-wrap">
                            <span>₦{(card.val || 0).toLocaleString()}</span>
                            {card.isMain && card.actionType === 'withdraw' && onWithdraw && (
                                <button 
                                    onClick={onWithdraw}
                                    disabled={card.val === 0}
                                    className="bg-black text-[#BEF264] text-xs px-4 py-2.5 rounded-full uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors shadow-xl"
                                >
                                    Withdraw Funds
                                </button>
                            )}
                            {card.isMain && card.actionType === 'fund' && onFund && (
                                <button 
                                    onClick={onFund}
                                    className="bg-blue-600 text-white text-xs px-4 py-2.5 rounded-full uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-xl"
                                >
                                    Fund Wallet
                                </button>
                            )}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{card.label}</p>
                            {card.label === 'Pending Escrow' && (
                                <div className="group relative flex items-center justify-center cursor-help">
                                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-amber-500 transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-[10px] font-medium p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-relaxed text-center">
                                        Funds are held securely to protect both parties. They are released to your Available Payout immediately when you mark the inspection as Completed, or automatically 24 hours after the scheduled time.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
