'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, User, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import NextImage from 'next/image';

export function MessageList() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'HOUSING' | 'COMMUNITY'>('ALL');
    const supabase = createClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlUserId = searchParams?.get('userId');

    useEffect(() => {
        if (urlUserId) {
            router.push(`/messages/${urlUserId}`);
        }
    }, [urlUserId, router]);

    useEffect(() => {
        async function fetchConversations() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setUserId(user.id);

                // 1. Fetch conversations and chat_rooms (Multi-table support)
                const [
                    { data: rawConvsData },
                    { data: rawRoomsData }
                ] = await Promise.all([
                    supabase.from('conversations')
                        .select(`*`)
                        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`),
                    supabase.from('chat_rooms')
                        .select(`*`)
                        .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`)
                ]);

                const allRawConvs = [
                    ...(rawConvsData || []).map((c: any) => ({ ...c, table: 'conversations' })),
                    ...(rawRoomsData || []).map((c: any) => ({ ...c, table: 'chat_rooms', context_type: 'market', participant_a: c.participant_one_id, participant_b: c.participant_two_id }))
                ];

                const propertyIds = allRawConvs.map(c => c.property_id).filter(Boolean);
                const itemIds = allRawConvs.map(c => c.item_id).filter(Boolean);

                const [{ data: properties }, { data: marketItems }] = await Promise.all([
                    supabase.from('properties').select('id, title, images').in('id', propertyIds),
                    supabase.from('market_listings').select('id, title, image_url').in('id', itemIds)
                ]);

                const propsMap = new Map(properties?.map((p: any) => [p.id, p]));
                const itemsMap = new Map(marketItems?.map((i: any) => [i.id, i]));

                const allConvs = allRawConvs.map(conv => ({
                    ...conv,
                    property: propsMap.get(conv.property_id),
                    item: itemsMap.get(conv.item_id)
                }));

                // 2. Fetch only messages where the user is a participant
                const { data: allMsgsData } = await supabase.from('messages')
                    .select('*')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                const allMsgs = allMsgsData || [];

                // 3. Resolve profiles
                const participantIds = Array.from(new Set<string>([
                    ...allConvs.map((c: any) => c.participant_a),
                    ...allConvs.map((c: any) => c.participant_b),
                    ...allMsgs.map((m: any) => m.sender_id),
                    ...allMsgs.map((m: any) => m.receiver_id)
                ])).filter((id: any) => id && id !== user.id);

                const [
                    { data: mainProfiles },
                    { data: studentProfiles },
                    { data: agentProfiles },
                    { data: landlordProfiles }
                ] = await Promise.all([
                    supabase.from('profiles').select('id, full_name, avatar_url').in('id', participantIds),
                    supabase.from('student_accounts').select('id, full_name, avatar_url').in('id', participantIds),
                    supabase.from('agent_accounts').select('id, full_name, avatar_url').in('id', participantIds),
                    supabase.from('landlord_accounts').select('id, business_name, logo_url').in('id', participantIds)
                ]);
                
                const profilesMap = new Map();
                landlordProfiles?.forEach((p: any) => profilesMap.set(p.id, { id: p.id, full_name: p.business_name, avatar_url: p.logo_url }));
                agentProfiles?.forEach((p: any) => profilesMap.set(p.id, p));
                studentProfiles?.forEach((p: any) => profilesMap.set(p.id, p));
                mainProfiles?.forEach((p: any) => profilesMap.set(p.id, p));

                // 4. Group results
                const map = new Map();

                for (const conv of allConvs) {
                    const cId = conv.id;
                    const otherId = conv.participant_a === user.id ? conv.participant_b : conv.participant_a;
                    const otherProfile = profilesMap.get(otherId);
                    
                    // Categorization Logic:
                    // Housing -> Specifically from a property listing
                    // Community -> Roommates, Market, Services
                    const isHousing = !!conv.property_id || conv.context_type === 'housing';
                    const category = isHousing ? 'HOUSING' : 'COMMUNITY';
                    
                    const groupKey = category === 'COMMUNITY' ? `comm-${otherId}` : `house-${otherId}-${conv.property_id || cId}`;

                    const lastMsg = allMsgs.find((m: any) => m.room_id === cId || m.conversation_id === cId);

                    let contextTitle = '';
                    if (conv.item) contextTitle = `Market: ${conv.item.title}`;
                    else if (conv.context_type === 'roommate') contextTitle = `Roommate Link`;
                    else if (conv.property) contextTitle = conv.property.title;
                    else contextTitle = category === 'HOUSING' ? 'Housing Inquiry' : 'Community';

                    const msgTime = lastMsg?.created_at || conv.last_message_at || conv.created_at;

                    map.set(groupKey, {
                        id: otherId,
                        conversationId: cId,
                        roomId: conv.table === 'chat_rooms' ? cId : null,
                        name: otherProfile?.full_name || 'User',
                        avatar: otherProfile?.avatar_url,
                        lastMessage: lastMsg?.content || 'Started a conversation',
                        time: msgTime,
                        last_message_at: conv.last_message_at || msgTime,
                        contextTitle: contextTitle,
                        category: category,
                        groupKey: groupKey
                    });
                }

                // Add direct messages not in conversations
                allMsgs.forEach((msg: any) => {
                    const mRoomId = msg.room_id || msg.conversation_id;
                    const roomInfo = mRoomId ? allRawConvs.find(c => c.id === mRoomId) : null;
                    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                    const isHousing = !!msg.property_id || !!roomInfo?.property_id || roomInfo?.category === 'HOUSING' || roomInfo?.context_type === 'housing';
                    const category = isHousing ? 'HOUSING' : 'COMMUNITY';
                    const propId = msg.property_id || roomInfo?.property_id || null;
                    
                    const groupKey = category === 'COMMUNITY' ? `comm-${otherId}` : `house-${otherId}-${propId || mRoomId}`;
                    
                    const existing = map.get(groupKey);
                    
                    if (!mRoomId && !existing) {
                        const otherProfile = profilesMap.get(otherId);
                        map.set(groupKey, {
                            id: otherId,
                            name: otherProfile?.full_name || 'User',
                            avatar: otherProfile?.avatar_url,
                            lastMessage: msg.content,
                            time: msg.created_at,
                            last_message_at: msg.created_at,
                            contextTitle: isHousing ? 'Housing Inquiry' : 'Direct Message',
                            category: category,
                            groupKey: groupKey
                        });
                    } else if (existing && new Date(msg.created_at) > new Date(existing.time)) {
                        const bothDMs = !mRoomId && !existing.conversationId && !existing.roomId;
                        const matchRoom = mRoomId && (mRoomId === existing.conversationId || mRoomId === existing.roomId);
                        
                        if (bothDMs || matchRoom) {
                            existing.lastMessage = msg.content;
                            existing.time = msg.created_at;
                            existing.last_message_at = msg.created_at;
                        }
                    }
                });

                setConversations(Array.from(map.values()).sort((a: any, b: any) => 
                    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                ));
            } catch (err) {
                console.error('Error fetching conversations:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchConversations();

        const channel = supabase
            .channel('message_list_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchConversations();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const filteredConversations = conversations.filter((c: any) => {
        if (filter === 'ALL') return true;
        return c.category === filter;
    });

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#BEF264] animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Filter Chips */}
            <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-100 dark:border-white/5 w-fit">
                <button 
                    onClick={() => setFilter('ALL')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-black text-[#BEF264]' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                    Unified Inbox
                </button>
                <button 
                    onClick={() => setFilter('HOUSING')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'HOUSING' ? 'bg-black text-[#BEF264]' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                    Housing
                </button>
                <button 
                    onClick={() => setFilter('COMMUNITY')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'COMMUNITY' ? 'bg-black text-[#BEF264]' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                    Community
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Quick Action: Message Yourself */}
                {filter === 'ALL' && (
                    <button 
                        onClick={async () => {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (user) {
                                const { data: allMsgs } = await supabase.from('messages')
                                .select('*')
                                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
                                
                                const existing = allMsgs?.filter((m: any) => m.sender_id === user.id && m.receiver_id === user.id);
                                
                                if (!existing || existing.length === 0) {
                                    await supabase.from('messages').insert({
                                        sender_id: user.id,
                                        receiver_id: user.id,
                                        content: 'Welcome to your Personal Notes! Save links, drafts, or ideas here.'
                                    });
                                }
                                window.location.href = `/messages/${user.id}`;
                            }
                        }}
                        className="bg-[#BEF264]/10 dark:bg-[#BEF264]/5 p-6 rounded-[2rem] border-2 border-dashed border-[#BEF264]/30 hover:border-[#BEF264] transition-all flex items-center gap-6 group"
                    >
                        <div className="w-14 h-14 bg-[#BEF264] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#BEF264]/20 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Personal Notes</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0D9488]">Save links & drafts to yourself</p>
                        </div>
                    </button>
                )}

                {filteredConversations.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem] p-16 text-center relative overflow-hidden mt-4">
                        <MessageSquare className="w-16 h-16 text-gray-200 dark:text-neutral-800 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">No {filter !== 'ALL' ? filter.toLowerCase() : ''} Messages</h2>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                            Your messages will appear here once you start a conversation.
                        </p>
                    </div>
                ) : (
                    filteredConversations.map((chat: any) => (
                        <Link 
                            key={chat.groupKey}
                            href={`/messages/${chat.id}?room_id=${chat.roomId || chat.conversationId || ''}${chat.category === 'HOUSING' ? '&category=HOUSING' : ''}`}
                            className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 flex items-center gap-6 hover:shadow-xl hover:border-[#BEF264]/30 transition-all group"
                        >
                            <div className="w-14 h-14 bg-[#BEF264]/10 dark:bg-[#BEF264]/5 rounded-full flex items-center justify-center text-[#BEF264] overflow-hidden relative shrink-0">
                                {chat.avatar ? (
                                    <NextImage src={chat.avatar} alt={chat.name} fill className="object-cover" />
                                ) : (
                                    <User className="w-6 h-6" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex flex-col">
                                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                            {chat.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${chat.category === 'HOUSING' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-[#BEF264] text-black'}`}>
                                                {chat.category || 'COMMUNITY'}
                                            </span>
                                            {chat.contextTitle && <span className="text-[9px] text-gray-400 lowercase font-black tracking-normal truncate max-w-[150px]">{chat.contextTitle}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(chat.last_message_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-neutral-400 truncate font-medium mt-1">{chat.lastMessage}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
