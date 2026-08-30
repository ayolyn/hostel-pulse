'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

export function GlobalSupportWidget() {
    const { user } = useAuth();
    const supabase = createClient();
    
    const [isOpen, setIsOpen] = useState(false);
    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [aiTyping, setAiTyping] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState<string>('');
    const [sending, setSending] = useState(false);
    const [profileName, setProfileName] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user || !isOpen || ticket) return;

        const initChat = async () => {
            const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
            const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'there';
            setProfileName(firstName);

            // Find existing open or pending ticket
            let { data: existingTicket } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', user.id)
                .neq('status', 'Resolved')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!existingTicket) {
                // Create a new one
                const { data: newTicket, error } = await supabase
                    .from('support_tickets')
                    .insert({ user_id: user.id, subject: 'General Support', status: 'Open' })
                    .select()
                    .single();
                    
                if (!error) existingTicket = newTicket;
            }

            if (existingTicket) {
                setTicket(existingTicket);
                // Load messages
                const { data: msgs } = await supabase
                    .from('ticket_messages')
                    .select('*')
                    .eq('ticket_id', existingTicket.id)
                    .order('created_at', { ascending: true });
                
                if (msgs && msgs.length > 0) {
                    setMessages(msgs);
                } else {
                    // Initial greeting
                    const greeting = {
                        ticket_id: existingTicket.id,
                        sender_role: 'ai',
                        content: `Hi ${firstName}, I'm the HostelPulse AI Assistant. How can I help you today?`
                    };
                    await supabase.from('ticket_messages').insert(greeting);
                }
            }
        };

        initChat();
    }, [user, supabase, isOpen, ticket]);

    useEffect(() => {
        if (!ticket) return;

        const channel = supabase.channel(`ticket_messages_${ticket.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${ticket.id}` }, (payload: any) => {
                setMessages(prev => prev.some(msg => msg.id === payload.new.id) ? prev : [...prev, payload.new]);
                scrollToBottom();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [ticket, supabase]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages]);

    useEffect(() => {
        const handleOpenTicketEvent = async (e: any) => {
            if (!user || !user.id) return;
            const ticketId = e.detail?.ticketId;
            if (!ticketId) return;

            if (ticketId === 'new') {
                setTicket(null);
                setIsOpen(true);
                return;
            }

            setIsOpen(true);
            
            const { data: fetchedTicket } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('id', ticketId)
                .single();
                
            if (fetchedTicket) {
                setTicket(fetchedTicket);
                setMessages([]);
                const { data: msgs } = await supabase
                    .from('ticket_messages')
                    .select('*')
                    .eq('ticket_id', ticketId)
                    .order('created_at', { ascending: true });
                
                if (msgs) setMessages(msgs);
            }
        };

        window.addEventListener('open-support-ticket', handleOpenTicketEvent);
        return () => window.removeEventListener('open-support-ticket', handleOpenTicketEvent);
    }, [supabase, user]);

    // Inactivity Timer
    useEffect(() => {
        if (!ticket || ticket.status === 'Resolved') return;

        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

        inactivityTimer.current = setTimeout(async () => {
            // Mark as resolved
            await supabase.from('support_tickets').update({ status: 'Resolved' }).eq('id', ticket.id);
            await supabase.from('ticket_messages').insert({
                ticket_id: ticket.id,
                sender_role: 'system',
                content: 'Chat ended automatically due to 15 minutes of inactivity.'
            });
            setTicket((prev: any) => prev ? { ...prev, status: 'Resolved' } : null);
        }, 15 * 60 * 1000); // 15 minutes

        return () => {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        };
    }, [ticket?.id, ticket?.status, messages, supabase]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !ticket) return;

        const msgText = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Insert user message and use database ID for UI update to prevent duplicates
        const { data: insertedMsg } = await supabase.from('ticket_messages').insert({
            ticket_id: ticket.id,
            sender_role: 'user',
            content: msgText
        }).select().single();

        if (insertedMsg) {
            setMessages(prev => prev.some(msg => msg.id === insertedMsg.id) ? prev : [...prev, insertedMsg]);
            scrollToBottom();
        }

        setSending(false);

        // If ticket is Open (AI mode), hit OpenAI API with stream
        if (ticket.status === 'Open') {
            setAiTyping(true);
            setStreamingMessage('');
            try {
                // Construct messages array to send (using insertedMsg or msgText if it failed)
                const historyToSend = [...messages, { sender_role: 'user', content: msgText }];

                const response = await fetch('/api/support/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: historyToSend }),
                });

                if (!response.body) throw new Error("No response body");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullResponse = '';

                setAiTyping(false); // Stop typing indicator once stream starts

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunkText = decoder.decode(value);
                    fullResponse += chunkText;
                    setStreamingMessage(fullResponse);
                    scrollToBottom();
                }

                // Stream finished, save to DB
                await supabase.from('ticket_messages').insert({
                    ticket_id: ticket.id,
                    sender_role: 'ai',
                    content: fullResponse
                });
                
                setStreamingMessage('');

            } catch (err) {
                console.error("Failed to fetch AI response", err);
                setAiTyping(false);
                setStreamingMessage('');
            }
        }
    };

    const handleEscalate = async () => {
        if (!ticket) return;
        
        await supabase.from('support_tickets').update({ status: 'Pending Admin' }).eq('id', ticket.id);
        
        await supabase.from('ticket_messages').insert({
            ticket_id: ticket.id,
            sender_role: 'system',
            content: "Your ticket has been escalated. An admin will be with you shortly."
        });
        setTicket((prev: any) => ({ ...prev, status: 'Pending Admin' }));
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-black dark:bg-[#BEF264] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-4 border-white dark:border-neutral-900"
                >
                    <MessageSquare className="w-6 h-6 text-[#BEF264] dark:text-black" />
                </button>
            )}

            {isOpen && (
                <div className="w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-white/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 h-[500px]">
                    {/* Header */}
                    <div className="bg-black dark:bg-[#BEF264] p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bot className="w-6 h-6 text-[#BEF264] dark:text-black" />
                                <h3 className="font-black text-[#BEF264] dark:text-black uppercase tracking-tight">HostelPulse Support</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {ticket?.status === 'Open' && (
                                    <button 
                                        onClick={async () => {
                                            if (!ticket) return;
                                            await supabase.from('support_tickets').update({ status: 'Resolved' }).eq('id', ticket.id);
                                            await supabase.from('ticket_messages').insert({ ticket_id: ticket.id, sender_role: 'system', content: 'Chat ended by user.' });
                                            setTicket(null);
                                            setMessages([]);
                                            setIsOpen(false);
                                        }}
                                        className="text-xs bg-black text-[#BEF264] px-2 py-1 rounded-md font-bold hover:bg-neutral-800 transition-colors"
                                    >
                                        End Chat
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="text-[#BEF264] dark:text-black hover:opacity-70 transition-opacity">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {ticket?.status === 'Open' ? (
                            <button 
                                onClick={handleEscalate}
                                className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full flex items-center justify-center gap-1 hover:bg-red-600 transition-colors self-start"
                            >
                                <AlertTriangle className="w-3 h-3" />
                                Escalate to Human/Dispute
                            </button>
                        ) : (
                            <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full flex items-center justify-center gap-1 self-start">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Waiting for Admin
                            </span>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950">
                        {messages.map((msg, idx) => {
                            const isUser = msg.sender_role === 'user';
                            const isSystem = msg.sender_role === 'system';
                            
                            if (isSystem) {
                                return (
                                    <div key={msg.id || idx} className="flex justify-center">
                                        <span className="bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                            {msg.content}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div key={msg.id || idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm font-medium ${
                                        isUser 
                                            ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-sm' 
                                            : msg.sender_role === 'admin' 
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-tl-sm border border-blue-200 dark:border-blue-900/50'
                                                : 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-tl-sm'
                                    }`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-[9px] mt-1 text-right ${isUser ? 'opacity-70' : 'opacity-50'}`}>
                                            {msg.sender_role === 'admin' ? 'Admin' : isUser ? 'You' : 'AI'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {aiTyping && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl rounded-tl-sm p-3 flex gap-1">
                                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        {streamingMessage && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-2xl p-3 text-sm font-medium bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-tl-sm">
                                    <p className="whitespace-pre-wrap">{streamingMessage}</p>
                                    <p className="text-[9px] mt-1 text-right opacity-50">AI</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {ticket?.status === 'Resolved' ? (
                        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-white/10 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                                This ticket is resolved. Open a new ticket for further help.
                            </span>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-white/10 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-600 rounded-xl px-4 py-2 text-sm text-black dark:text-white outline-none"
                            />
                            <button 
                                type="submit" 
                                disabled={sending || !newMessage.trim()}
                                className="bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black p-2 rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
