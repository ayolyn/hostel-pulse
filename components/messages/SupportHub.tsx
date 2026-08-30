import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { ChevronDown, MessageSquare, LifeBuoy } from 'lucide-react';

import { supportFAQs } from '@/lib/data/faqs';

export function SupportHub() {
    const { user } = useAuth();
    const supabase = createClient();
    const [tickets, setTickets] = useState<any[]>([]);
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = supportFAQs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
        if (!acc[faq.category]) acc[faq.category] = [];
        acc[faq.category].push(faq);
        return acc;
    }, {} as Record<string, typeof supportFAQs>);

    useEffect(() => {
        if (!user) return;
        
        const fetchTickets = async () => {
            const { data } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (data) setTickets(data);
        };

        fetchTickets();

        const channel = supabase.channel(`support_tickets_${user.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `user_id=eq.${user.id}` }, () => {
                fetchTickets();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase]);

    const handleOpenTicket = (ticketId: string) => {
        window.dispatchEvent(new CustomEvent('open-support-ticket', { detail: { ticketId } }));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-24">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                    <LifeBuoy className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Help & Support Hub</h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Find answers or track your tickets</p>
                </div>
            </div>

            {/* FAQ Section */}
            <section className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                    <input 
                        type="text" 
                        placeholder="Search for help..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-50 dark:bg-neutral-800 border border-transparent dark:border-white/10 rounded-xl px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-neutral-300 dark:focus:border-neutral-600 w-full md:w-64"
                    />
                </div>
                <div className="space-y-8">
                    {filteredFaqs.length === 0 ? (
                        <p className="text-gray-500 text-sm italic py-4">No FAQs match your search.</p>
                    ) : (
                        Object.entries(groupedFaqs).map(([category, faqs]) => (
                            <div key={category} className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-purple-500">{category}</h3>
                                {faqs.map((faq) => (
                                    <div key={faq.question} className="border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden transition-all">
                                        <button 
                                            onClick={() => setExpandedFaq(expandedFaq === faq.question ? null : faq.question)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <span className="font-bold text-sm text-gray-900 dark:text-gray-200 text-left">{faq.question}</span>
                                            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedFaq === faq.question ? 'rotate-180' : ''}`} />
                                        </button>
                                        {expandedFaq === faq.question && (
                                            <div className="p-4 bg-white dark:bg-neutral-900 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-black/20 p-6 rounded-2xl">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Can't find what you're looking for?</h3>
                        <p className="text-sm text-gray-500 mt-1">Our support team is ready to assist you.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenTicket('new')}
                        className="bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-[#a6d456] transition-colors whitespace-nowrap"
                    >
                        Open a Support Ticket
                    </button>
                </div>
            </section>

            {/* Ticket History Section */}
            <section className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5">
                    <h2 className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-purple-500" /> Your Ticket History
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-black/20 text-[10px] uppercase tracking-widest text-gray-500">
                                <th className="px-6 py-4 font-black">Ticket ID</th>
                                <th className="px-6 py-4 font-black">Subject</th>
                                <th className="px-6 py-4 font-black">Status</th>
                                <th className="px-6 py-4 font-black">Date</th>
                                <th className="px-6 py-4 font-black text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No support tickets found. Need help? Use the chat widget!
                                    </td>
                                </tr>
                            ) : (
                                tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleOpenTicket(ticket.id)}>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                            #{ticket.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                            {ticket.subject}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                ticket.status === 'Pending Admin' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                                                'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest group-hover:bg-purple-500 group-hover:text-white transition-colors"
                                            >
                                                View Chat
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
