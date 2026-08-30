import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send } from 'lucide-react';

export function AdminChatWindow({ ticketId }: { ticketId: string }) {
    const supabase = createClient();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ticketId) return;

        const loadMessages = async () => {
            const { data } = await supabase
                .from('ticket_messages')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });
            
            if (data) setMessages(data);
            scrollToBottom();
        };

        loadMessages();

        const channel = supabase.channel(`admin_ticket_messages_${ticketId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${ticketId}` }, (payload: any) => {
                setMessages(prev => [...prev, payload.new]);
                scrollToBottom();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [ticketId, supabase]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !ticketId) return;

        const text = newMessage.trim();
        setNewMessage('');
        setSending(true);

        await supabase.from('ticket_messages').insert({
            ticket_id: ticketId,
            sender_role: 'admin',
            content: text
        });

        setSending(false);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#0F172A]/50">
            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
                    const isAdmin = msg.sender_role === 'admin';
                    const isSystem = msg.sender_role === 'system';

                    if (isSystem) {
                        return (
                            <div key={msg.id || idx} className="flex justify-center">
                                <span className="bg-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                    {msg.content}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                                isAdmin 
                                    ? 'bg-purple-600 text-white rounded-tr-sm' 
                                    : 'bg-[#1e293b] text-gray-200 border border-white/5 rounded-tl-sm'
                            }`}>
                                <p className="leading-relaxed">{msg.content}</p>
                                <p className={`text-[9px] mt-2 ${isAdmin ? 'text-purple-200 text-right' : 'text-gray-500 text-left'} uppercase tracking-widest font-black`}>
                                    {isAdmin ? 'Admin (You)' : msg.sender_role === 'user' ? 'User' : 'AI Assistant'}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-[#1e293b] border-t border-white/5">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message to the user..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500/50 outline-none placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
