"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Send, AlertTriangle, Clock, MessageSquare, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { resolveDispute } from '../../actions';

export default function AdminCaseRoomClient({ 
    escrowId, 
    initialTransaction, 
    initialMessages, 
    currentUser 
}: { 
    escrowId: string, 
    initialTransaction: any, 
    initialMessages: any[], 
    currentUser: any 
}) {
    const router = useRouter();
    const supabase = createClient();

    const [transaction, setTransaction] = useState<any>(initialTransaction);
    const [messages, setMessages] = useState<any[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [resolving, setResolving] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const channel = supabase.channel(`admin_room_${escrowId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dispute_messages', filter: `escrow_id=eq.${escrowId}` }, async (payload: any) => {
                const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', payload.new.sender_id).single();
                setMessages(prev => [...prev, { ...payload.new, sender: profile }]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [escrowId, supabase]);

    useEffect(() => {
        if (!transaction?.dispute_deadline) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const deadline = new Date(transaction.dispute_deadline).getTime();
            const distance = deadline - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("EXPIRED");
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [transaction]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        setSending(true);
        try {
            await fetch('/api/disputes/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    escrowId,
                    message: newMessage.trim()
                })
            });
            setNewMessage('');
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async (resolution: 'Refunded' | 'Released') => {
        if (!confirm(`Are you sure you want to FORCE ${resolution.toUpperCase()}? This action is irreversible.`)) return;
        setResolving(true);
        try {
            await resolveDispute(escrowId, resolution);
            setTransaction((prev: any) => ({ ...prev, status: resolution }));
            alert('Dispute resolved successfully.');
            router.push('/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c?tab=disputes');
        } catch (err) {
            console.error(err);
            alert('Failed to resolve dispute.');
        } finally {
            setResolving(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#0F172A] text-white">
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c?tab=disputes" className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-xl font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6" />
                        God Mode: Case Resolution
                    </h2>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Details & Resolution */}
                <div className="w-1/3 border-r border-white/5 p-5 flex flex-col gap-5 overflow-y-auto bg-black/20">
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-red-500">
                            <Clock className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">SLA Deadline</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-tighter">{timeLeft || 'Calculating...'}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Transaction Details</h3>
                        <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
                            <p className="text-sm text-gray-400 font-medium mb-1">Item</p>
                            <p className="text-lg font-black text-white">{transaction?.market_listings?.title || 'Unknown Item'}</p>
                            
                            <p className="text-sm text-gray-400 font-medium mt-4 mb-1">Amount</p>
                            <p className="text-2xl font-black text-[#BEF264]">₦{Number(transaction?.amount || 0).toLocaleString()}</p>

                            <p className="text-sm text-gray-400 font-medium mt-4 mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                transaction?.status === 'Disputed' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>{transaction?.status}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Parties</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Buyer</span>
                                <p className="text-sm font-bold text-white mt-1 truncate">{transaction?.payer?.full_name || transaction?.payer?.first_name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 truncate">{transaction?.payer?.email}</p>
                            </div>
                            <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Seller</span>
                                <p className="text-sm font-bold text-white mt-1 truncate">{transaction?.payee?.full_name || transaction?.payee?.first_name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 truncate">{transaction?.payee?.email}</p>
                            </div>
                        </div>
                    </div>

                    {transaction?.status === 'Disputed' && (
                        <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Executive Action</h3>
                            <button 
                                onClick={() => handleResolve('Refunded')}
                                disabled={resolving}
                                className="w-full px-6 py-3 bg-blue-500/10 text-blue-400 font-black uppercase tracking-widest text-xs rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                            >
                                Force Refund to Buyer
                            </button>
                            <button 
                                onClick={() => handleResolve('Released')}
                                disabled={resolving}
                                className="w-full px-6 py-3 bg-emerald-500/10 text-emerald-400 font-black uppercase tracking-widest text-xs rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                            >
                                Force Release to Seller
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel: Chat Feed */}
                <div className="flex-1 flex flex-col bg-[#0f172a]">
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-sm font-medium">No messages yet. Waiting for parties.</p>
                            </div>
                        ) : (
                            messages.map((m) => {
                                const isMe = m.sender_id === currentUser?.id;
                                const isAdmin = m.is_admin;
                                const isBuyer = m.sender_id === transaction?.payer_id;
                                const isSeller = m.sender_id === transaction?.payee_id;
                                const senderName = isBuyer 
                                    ? (transaction?.payer?.full_name || transaction?.payer?.first_name || 'Buyer')
                                    : isSeller 
                                        ? (transaction?.payee?.full_name || transaction?.payee?.first_name || 'Seller')
                                        : 'User';

                                return (
                                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-baseline gap-2 mb-1 px-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {isAdmin ? 'Global HQ Admin' : (isBuyer ? 'Buyer: ' : 'Seller: ') + senderName}
                                            </span>
                                            <span className="text-[9px] text-gray-600 font-mono">
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`
                                            max-w-[75%] p-4 rounded-3xl text-sm font-medium
                                            ${isAdmin ? 'bg-red-500/20 border-red-500/30 text-red-100 border' : 
                                              'bg-[#1e293b] text-white border border-white/10'}
                                            ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}
                                        `}>
                                            {m.message?.startsWith('[EVIDENCE_IMAGE]: ') ? (
                                                <div className="space-y-2">
                                                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">Evidence Attached</span>
                                                    <img src={m.message.replace('[EVIDENCE_IMAGE]: ', '')} alt="Evidence" className="rounded-xl max-w-full h-auto object-cover border border-black/10 dark:border-white/10" />
                                                </div>
                                            ) : (
                                                m.message
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Admin Input Area */}
                    <div className="p-6 bg-[#1e293b] border-t border-white/5 shrink-0">
                        {transaction?.status === 'Disputed' ? (
                            <form onSubmit={handleSend} className="flex gap-4">
                                <input 
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Send an official message to both parties..."
                                    className="flex-1 bg-black/20 border border-red-500/20 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 rounded-2xl flex items-center justify-center hover:bg-red-500/30 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shrink-0"
                                >
                                    {sending ? 'Sending...' : 'Send as Admin'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center p-4">
                                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Case Closed</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
