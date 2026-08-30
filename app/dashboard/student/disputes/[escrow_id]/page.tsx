"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Send, AlertTriangle, Clock, MessageSquare, Paperclip } from 'lucide-react';
import Link from 'next/link';

export default function StudentCaseRoom() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const escrowId = params.escrow_id as string;

    const [transaction, setTransaction] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchCase = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/join');
            setCurrentUser(user);

            const { data: tx } = await supabase
                .from('escrow_transactions')
                .select('*')
                .eq('id', escrowId)
                .single();
            
            if (!tx) return router.push('/dashboard/student?tab=wallet');

            const resolvedBuyerId = tx.payer_id || tx.buyer_id;
            const resolvedSellerId = tx.payee_id || tx.seller_id;
            const otherPartyId = user?.id === resolvedBuyerId ? resolvedSellerId : resolvedBuyerId;

            const { data: otherProfile } = await supabase.from('profiles').select('*').eq('id', otherPartyId).single();
            setTransaction({ ...tx, otherParty: otherProfile });

            const { data: msgs, error } = await supabase
                .from('dispute_messages')
                .select('*')
                .eq('escrow_id', escrowId)
                .order('created_at', { ascending: true });
            
            if (error) console.error("MESSAGE FETCH ERROR:", error);
            if (msgs) setMessages(msgs);
            setLoading(false);

            // Realtime
            const channel = supabase.channel(`room_${escrowId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dispute_messages', filter: `escrow_id=eq.${escrowId}` }, async (payload: any) => {
                    setMessages(prev => [...prev, payload.new]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };
        fetchCase();
    }, [escrowId, supabase, router]);

    useEffect(() => {
        if (!transaction) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            
            let deadline;
            if (transaction.dispute_deadline) {
                deadline = new Date(transaction.dispute_deadline).getTime();
            } else {
                const baseDate = transaction.created_at ? new Date(transaction.created_at).getTime() : now;
                deadline = baseDate + 48 * 60 * 60 * 1000;
            }

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

        const messageText = newMessage.trim();
        setSending(true);
        setNewMessage('');
        
        try {
            const res = await fetch('/api/disputes/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    escrowId,
                    message: messageText
                })
            });
            if (res.ok) {
                setMessages(prev => [...prev, {
                    id: Math.random().toString(),
                    escrow_id: escrowId,
                    sender_id: currentUser.id,
                    message: messageText,
                    is_admin: false,
                    created_at: new Date().toISOString()
                }]);
            } else {
                console.error("Failed to send message");
                setNewMessage(messageText);
            }
        } catch (error) {
            console.error(error);
            setNewMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        setSending(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${escrowId}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('evidence')
                .upload(fileName, file);
                
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('evidence')
                .getPublicUrl(fileName);

            const messageText = `[EVIDENCE_IMAGE]: ${publicUrl}`;

            const res = await fetch('/api/disputes/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    escrowId,
                    message: messageText
                })
            });
            
            if (res.ok) {
                setMessages(prev => [...prev, {
                    id: Math.random().toString(),
                    escrow_id: escrowId,
                    sender_id: currentUser.id,
                    message: messageText,
                    is_admin: false,
                    created_at: new Date().toISOString()
                }]);
            } else {
                console.error("Failed to send image message");
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-white font-black tracking-widest uppercase">Initializing Secure Case Room...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Link href="/dashboard/student?tab=wallet" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Back to Wallet</span>
            </Link>

            <div className="bg-[#1e293b] rounded-[2.5rem] border border-red-500/20 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 bg-red-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Active Dispute</h1>
                            <p className="text-xs text-gray-400 font-medium">{transaction.market_listings?.title || 'Transaction'}</p>
                        </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                        <Clock className="w-5 h-5 text-red-500" />
                        <div>
                            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">SLA Deadline</p>
                            <p className="text-lg font-black text-white font-mono">{timeLeft || 'Calculating...'}</p>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="h-[50vh] overflow-y-auto p-6 md:p-8 space-y-6 bg-[#0f172a]/50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-sm font-medium">No messages yet. Please provide your evidence.</p>
                        </div>
                    ) : (
                        messages.map((m) => {
                            const isMe = m.sender_id === currentUser?.id;
                            const isAdmin = m.is_admin;
                            const senderName = isMe ? 'You' : (isAdmin ? 'Global HQ Admin' : (transaction?.otherParty?.full_name || transaction?.otherParty?.first_name || 'Counterparty'));

                            return (
                                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mb-1 px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {senderName}
                                        </span>
                                        <span className="text-[9px] text-gray-600 font-mono">
                                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`
                                        max-w-[85%] md:max-w-[75%] p-4 rounded-3xl text-sm font-medium
                                        ${isAdmin ? 'bg-red-500/20 border-red-500/30 text-red-100 border' : 
                                          isMe ? 'bg-[#BEF264] text-black rounded-tr-sm' : 
                                          'bg-[#1e293b] text-white border border-white/10 rounded-tl-sm'}
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

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-[#1e293b] border-t border-white/5">
                    {transaction.status === 'Disputed' ? (
                        <form onSubmit={handleSend} className="flex gap-4">
                            <input 
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message or paste evidence links..."
                                className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-[#BEF264]/50 transition-colors"
                            />
                            <label className="bg-[#1e293b] border border-white/10 text-gray-400 w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all cursor-pointer shrink-0">
                                <Paperclip className="w-5 h-5" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={sending} />
                            </label>
                            <button 
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="bg-[#BEF264] text-black w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-[#a6d456] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    ) : (
                        (() => {
                            const isBuyer = currentUser?.id === transaction.payer_id || currentUser?.id === transaction.buyer_id;
                            const isSeller = currentUser?.id === transaction.payee_id || currentUser?.id === transaction.seller_id;
                            let bannerClass = "bg-gray-500/10 border-gray-500/20 text-gray-500";
                            let bannerText = `THIS DISPUTE HAS BEEN RESOLVED: ${transaction.status}`;

                            if (transaction.status === 'Refunded') {
                                if (isBuyer) {
                                    bannerClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
                                    bannerText = "DISPUTE CLOSED: FUNDS REFUNDED TO YOU";
                                } else if (isSeller) {
                                    bannerClass = "bg-red-500/10 border-red-500/20 text-red-500";
                                    bannerText = "DISPUTE CLOSED: FUNDS REFUNDED TO BUYER";
                                }
                            } else if (transaction.status === 'Released') {
                                if (isSeller) {
                                    bannerClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
                                    bannerText = "DISPUTE CLOSED: FUNDS RELEASED TO YOU";
                                } else if (isBuyer) {
                                    bannerClass = "bg-red-500/10 border-red-500/20 text-red-500";
                                    bannerText = "DISPUTE CLOSED: FUNDS RELEASED TO SELLER";
                                }
                            }

                            return (
                                <div className={`text-center p-4 border rounded-2xl ${bannerClass}`}>
                                    <p className="font-black uppercase tracking-widest text-xs">{bannerText}</p>
                                </div>
                            );
                        })()
                    )}
                </div>
            </div>
        </div>
    );
}
