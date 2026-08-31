"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Search,
    Send,
    Building2,
    Calendar,
    ChevronLeft,
    Loader2,
    MessageCircle,
    CheckCheck,
    Check,
    MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvRoom {
    id: string;
    participant_a: string;
    participant_b: string;
    property_id: string | null;
    item_id: string | null;
    context_type: string | null;
    last_message_at: string | null;
    // resolved
    otherUser: { id: string; full_name: string; avatar_url: string | null; phone: string | null } | null;
    property: { id: string; title: string; price: number; images: string[] } | null;
    last_message: string | null;
}

interface Msg {
    id: string;
    sender_id: string;
    receiver_id: string;
    conversation_id: string | null;
    room_id?: string | null;
    content: string;
    created_at: string;
    is_read: boolean;
    image_url?: string | null;
}

import { createInspectionLinkAction } from '@/app/actions/inspection';

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessagingTab({ userId, userRole }: { userId: string, userRole?: string }) {
    const supabase = createClient();

    const [rooms, setRooms] = useState<ConvRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<ConvRoom | null>(null);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState('');
    const [search, setSearch] = useState('');
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<any>(null);
    const searchParams = useSearchParams();
    const urlUserId = searchParams?.get('userId');

    // ── Fetch sidebar rooms ──────────────────────────────────────────────────
    const fetchRooms = useCallback(async () => {
        setLoadingRooms(true);
        try {
            const { data: rawMessages } = await supabase.from('messages')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

            const { data: rawConvs } = await supabase.from('conversations')
                .select('*')
                .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

            const { data: rawRooms } = await supabase.from('chat_rooms')
                .select('*')
                .or(`participant_one_id.eq.${userId},participant_two_id.eq.${userId}`);

            // Group messages into "rooms" by conversation_id OR by user pair if conversation_id is missing
            const roomMap = new Map<string, any>();
            
            (rawConvs || []).forEach((conv: any) => {
                const otherId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
                roomMap.set(conv.id, {
                    id: conv.id,
                    participant_a: userId,
                    participant_b: otherId,
                    property_id: conv.property_id,
                    last_message: 'No messages yet',
                    last_message_at: conv.created_at,
                    table: 'conversations'
                });
            });

            (rawRooms || []).forEach((room: any) => {
                const otherId = room.participant_one_id === userId ? room.participant_two_id : room.participant_one_id;
                roomMap.set(room.id, {
                    id: room.id,
                    participant_a: userId,
                    participant_b: otherId,
                    property_id: room.property_id,
                    last_message: 'No messages yet',
                    last_message_at: room.created_at,
                    table: 'chat_rooms'
                });
            });
            
            (rawMessages || []).forEach((msg: any) => {
                const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
                // create a pseudo room ID if both are missing
                const roomId = msg.room_id || msg.conversation_id || `direct_${[userId, otherId].sort().join('_')}`;
                
                if (!roomMap.has(roomId)) {
                    roomMap.set(roomId, {
                        id: roomId,
                        participant_a: userId,
                        participant_b: otherId,
                        property_id: msg.property_id,
                        last_message: msg.content,
                        last_message_at: msg.created_at,
                    });
                } else {
                    const room = roomMap.get(roomId);
                    if (new Date(msg.created_at) >= new Date(room.last_message_at)) {
                        room.last_message = msg.content;
                        room.last_message_at = msg.created_at;
                    }
                }
            });

            const data = Array.from(roomMap.values());

            const otherIds = data.map((r: any) => r.participant_b).filter(Boolean);
            const propIds  = data.map((r: any) => r.property_id).filter(Boolean);

            let mainP = [], stuP = [], agP = [], llP = [];
            if (otherIds.length > 0) {
                const results = await Promise.all([
                    supabase.from('profiles').select('id, full_name, avatar_url, phone').in('id', otherIds),
                    supabase.from('student_accounts').select('id, full_name, avatar_url, phone').in('id', otherIds),
                    supabase.from('agent_accounts').select('id, full_name, avatar_url, phone').in('id', otherIds),
                    supabase.from('landlord_accounts').select('id, business_name, logo_url, whatsapp_number').in('id', otherIds),
                ]);
                mainP = results[0].data || [];
                stuP = results[1].data || [];
                agP = results[2].data || [];
                
                // Map landlord fields to match the UI expected interface
                llP = (results[3].data || []).map((l: any) => ({
                    id: l.id,
                    full_name: l.business_name,
                    avatar_url: l.logo_url,
                    phone: l.whatsapp_number
                }));
            }
            
            const pMap = new Map<string, any>();
            (llP || []).forEach((p: any) => pMap.set(p.id, p));
            (agP || []).forEach((p: any) => pMap.set(p.id, p));
            (stuP || []).forEach((p: any) => pMap.set(p.id, p));
            (mainP || []).forEach((p: any) => pMap.set(p.id, p));

            // Resolve properties
            const { data: props } = propIds.length
                ? await supabase.from('properties').select('id, title, price, images, location').in('id', propIds)
                : { data: [] };
            const propMap = new Map((props || []).map((p: any) => [p.id, p]));

            // Build final array
            const resolved: ConvRoom[] = data.map(room => {
                return {
                    ...room,
                    otherUser: pMap.get(room.participant_b) || { id: room.participant_b, full_name: 'User', avatar_url: null, phone: null },
                    property:  room.property_id ? propMap.get(room.property_id) || null : null,
                };
            });

            setRooms(resolved);
        } catch (err) {
            console.error('fetchRooms error:', err);
        } finally {
            setLoadingRooms(false);
        }
    }, [userId, supabase]);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    // ── Auto-select room from URL ────────────────────────────────────────────
    useEffect(() => {
        const initUrlUser = async () => {
            if (!urlUserId || loadingRooms || activeRoom) return;
            
            const existingRoom = rooms.find(r => r.participant_b === urlUserId);
            if (existingRoom) {
                setActiveRoom(existingRoom);
                return;
            }

            // Create pseudo-room for new conversation
            const { data } = await supabase.from('profiles').select('id, full_name, avatar_url, phone').eq('id', urlUserId).single();
            if (data) {
                const newRoom: ConvRoom = {
                    id: `direct_${[userId, urlUserId].sort().join('_')}`,
                    participant_a: userId,
                    participant_b: urlUserId,
                    property_id: null,
                    item_id: null,
                    context_type: null,
                    last_message_at: new Date().toISOString(),
                    last_message: 'New Conversation',
                    otherUser: data,
                    property: null
                };
                setRooms(prev => [newRoom, ...prev]);
                setActiveRoom(newRoom);
            }
        };
        initUrlUser();
    }, [urlUserId, rooms, activeRoom, loadingRooms, supabase, userId]);

    // ── Fetch messages when a room is selected ───────────────────────────────
    const fetchMessages = useCallback(async (room: ConvRoom) => {
        setLoadingMsgs(true);
        setMessages([]);

        let all: Msg[] = [];
        
        if (room.id.startsWith('direct_')) {
            // Fetch direct messages with no conversation_id
            if (room.otherUser?.id) {
                const { data: direct } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`and(sender_id.eq.${userId},receiver_id.eq.${room.otherUser.id}),and(sender_id.eq.${room.otherUser.id},receiver_id.eq.${userId})`)
                    .is('conversation_id', null)
                    .is('room_id', null)
                    .order('created_at', { ascending: true });
                all = direct || [];
            }
        } else {
            // Fetch by either column
            const { data: conv } = await supabase
                .from('messages')
                .select('*')
                .or(`conversation_id.eq.${room.id},room_id.eq.${room.id}`)
                .order('created_at', { ascending: true });
            all = conv || [];
        }

        setMessages(all);
        setLoadingMsgs(false);
        setTimeout(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, 80);

        // Mark as read
        await supabase.from('messages')
            .update({ is_read: true })
            .eq('receiver_id', userId)
            .neq('is_read', true)
            .or(room.id.startsWith('direct_') 
                ? `and(sender_id.eq.${room.otherUser?.id},conversation_id.is.null,room_id.is.null)`
                : `conversation_id.eq.${room.id},room_id.eq.${room.id}`);
    }, [userId, supabase]);

    // ── Subscribe to realtime when room changes ──────────────────────────────
    useEffect(() => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
        if (!activeRoom) return;

        fetchMessages(activeRoom);

        const filterStr = activeRoom.id.startsWith('direct_') ? `receiver_id=eq.${userId}` : undefined;

        const ch = supabase
            .channel(`msg_tab_room_${activeRoom.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: filterStr,
            }, (payload: any) => {
                const m = payload.new as Msg;
                if (activeRoom.id.startsWith('direct_')) {
                    if (m.sender_id !== activeRoom.otherUser?.id && m.receiver_id !== activeRoom.otherUser?.id) {
                        return; // ignore if it doesn't match direct user
                    }
                } else {
                    if (m.conversation_id !== activeRoom.id && m.room_id !== activeRoom.id) {
                        return; // ignore if it doesn't belong to this room
                    }
                }
                setMessages(prev => prev.find(x => x.id === m.id) ? prev : [...prev, m]);
                setTimeout(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, 80);
            })
            .subscribe();

        channelRef.current = ch;
        return () => { supabase.removeChannel(ch); };
    }, [activeRoom?.id]);  // eslint-disable-line react-hooks/exhaustive-deps

    // ── Scroll on new messages ───────────────────────────────────────────────
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [messages]);

    // ── Select room ──────────────────────────────────────────────────────────
    const selectRoom = (room: ConvRoom) => {
        setActiveRoom(room);
        setInput('');
    };

    // ── Send message ─────────────────────────────────────────────────────────
    const sendMessage = async (customText?: string) => {
        const text = (customText || input).trim();
        if (!text || !activeRoom || sending) return;

        setSending(true);
        if (!customText) setInput('');

        const optimistic: Msg = {
            id: `opt-${Date.now()}`,
            sender_id: userId,
            receiver_id: activeRoom.otherUser?.id || '',
            conversation_id: activeRoom.id,
            content: text,
            created_at: new Date().toISOString(),
            is_read: false,
        };
        setMessages(prev => [...prev, optimistic]);

        const insertAttempts = [
            { room_id: activeRoom.id, conversation_id: activeRoom.id },
            { room_id: activeRoom.id },
            { conversation_id: activeRoom.id },
            { room: activeRoom.id },
            {}
        ];

        let lastError: any = null;
        let inserted: any = null;

        for (const attempt of insertAttempts) {
            const payload = {
                ...(activeRoom.id.startsWith('direct_') ? {} : attempt),
                sender_id: userId,
                receiver_id: activeRoom.otherUser?.id || '',
                property_id: activeRoom.property?.id || null,
                content: text,
                is_read: false,
            };

            const { data, error } = await supabase
                .from('messages')
                .insert(payload)
                .select()
                .maybeSingle();

            if (!error && data) {
                inserted = data;
                
                if (!activeRoom.id.startsWith('direct_')) {
                    await supabase.from('chat_rooms').update({ last_message_at: new Date().toISOString() }).eq('id', activeRoom.id);
                    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeRoom.id);
                }
                break;
            } else {
                lastError = error;
                if (error && !error.message.includes('foreign key') && !error.message.includes('column')) break;
            }
        }

        setSending(false);

        if (inserted) {
            setMessages(prev => {
                // Prevent duplication: if realtime listener already caught it, just remove the optimistic clone
                if (prev.some(m => m.id === inserted.id)) {
                    return prev.filter(m => m.id !== optimistic.id);
                }
                // Otherwise upgrade the optimistic clone to the real message
                return prev.map(m => m.id === optimistic.id ? inserted : m);
            });
            // Update last_message_at in sidebar
            setRooms(prev => prev.map(r => r.id === activeRoom.id
                ? { ...r, last_message: text, last_message_at: inserted.created_at }
                : r
            ));
        } else {
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
            import('react-hot-toast').then(({ toast }) => toast.error(`DB Error: ${lastError?.message || 'Unknown'}`));
            console.error('Send error:', lastError);
        }
    };

    const sendInspectionLink = async () => {
        if (!activeRoom?.property || userRole === 'buyer' || userRole === 'student') return;
        setSending(true);
        try {
            const newMsg = await createInspectionLinkAction(activeRoom.property.id, activeRoom.id, null, userId);
            setMessages(prev => [...prev, newMsg]);
            setRooms(prev => prev.map(r => r.id === activeRoom.id
                ? { ...r, last_message: newMsg.content, last_message_at: newMsg.created_at }
                : r
            ));
        } catch (error: any) {
            import('react-hot-toast').then(({ toast }) => toast.error(`Error: ${error.message}`));
            console.error('Send inspection link error:', error);
        } finally {
            setSending(false);
        }
    };

    // ── Filtered rooms ───────────────────────────────────────────────────────
    const filtered = rooms.filter(r =>
        !search || (r.otherUser?.full_name?.toLowerCase() || '').includes(search.toLowerCase())
    );

    // ── Loading state ────────────────────────────────────────────────────────
    if (loadingRooms) {
        return (
            <div className="flex h-[640px] items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-[#BEF264] animate-spin" />
            </div>
        );
    }

    // ── Empty state ──────────────────────────────────────────────────────────
    if (rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100">
                    <MessageCircle className="w-12 h-12 text-gray-200" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Inbox Quiet</h2>
                <p className="text-gray-400 max-w-sm mx-auto font-medium text-sm">
                    When students inquire about your listings, their messages will appear here.
                </p>
            </div>
        );
    }

    // ── Main UI ──────────────────────────────────────────────────────────────
    return (
        <div className="flex h-[700px] bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">

            {/* ── LEFT SIDEBAR ── */}
            <div className={`w-full md:w-80 border-r border-gray-200 dark:border-white/5 flex flex-col bg-gray-50 dark:bg-neutral-800/50 ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-neutral-900">
                    <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">Student Inquiries</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search student..."
                            className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#BEF264] transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Room list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filtered.map(room => (
                        <button
                            key={room.id}
                            onClick={() => selectRoom(room)}
                            className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-white dark:hover:bg-neutral-800 transition-all border-b border-gray-100 dark:border-white/5 text-left relative ${activeRoom?.id === room.id ? 'bg-white dark:bg-neutral-800 border-l-4 border-l-[#BEF264]' : 'border-l-4 border-l-transparent'}`}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden border border-gray-100 dark:border-neutral-600">
                                    {room.otherUser?.avatar_url ? (
                                        <img src={room.otherUser.avatar_url} alt={room.otherUser.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-sm">
                                            {room.otherUser?.full_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                {room.property?.images?.[0] && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md overflow-hidden border-2 border-white">
                                        <img src={room.property.images[0]} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                        {room.otherUser?.full_name || 'User'}
                                    </h4>
                                    {room.last_message_at && (
                                        <span className="text-[9px] font-bold text-gray-400 ml-2 shrink-0">
                                            {new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-500 truncate font-medium">
                                    {room.property && <span className="text-[#0D9488] font-black">via {room.property.title} · </span>}
                                    {room.last_message || 'Start conversation...'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── RIGHT PANE ── */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-neutral-900 ${!activeRoom ? 'hidden md:flex items-center justify-center' : 'flex'}`}>

                {!activeRoom ? (
                    /* Empty state */
                    <div className="text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-neutral-800" />
                        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Select a lead to start chatting</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveRoom(null)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl mr-1">
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shrink-0">
                                    {activeRoom.otherUser?.avatar_url ? (
                                        <img src={activeRoom.otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-gray-500 text-sm">
                                            {activeRoom.otherUser?.full_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">
                                        {activeRoom.otherUser?.full_name || 'User'}
                                    </h3>
                                    {activeRoom.property && (
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-black text-[#BEF264] uppercase tracking-widest">
                                                Inquiring about: {activeRoom.property.title}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                ₦{Number(activeRoom.property.price).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {activeRoom.property && (
                                    <Link
                                        href={`/property/${activeRoom.property.id}`}
                                        target="_blank"
                                        className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 font-black px-4 py-2.5 rounded-xl uppercase tracking-widest text-[9px] transition-all"
                                    >
                                        <Building2 className="w-4 h-4" />
                                        View Property
                                    </Link>
                                )}
                                {activeRoom.property && userRole !== 'buyer' && userRole !== 'student' && (
                                    <button
                                        onClick={sendInspectionLink}
                                        disabled={sending}
                                        className="hidden sm:flex items-center gap-2 bg-[#BEF264] hover:bg-[#a6d456] text-black font-black px-4 py-2.5 rounded-xl uppercase tracking-widest text-[9px] transition-all shadow-md shadow-[#BEF264]/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                        Send Inspection Link
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Message Stream */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50 dark:bg-neutral-900 custom-scrollbar">
                            {loadingMsgs ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 text-[#BEF264] animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                                    <MessageCircle className="w-10 h-10 text-gray-200 dark:text-neutral-800 mb-3" />
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">No messages yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Send a reply to start the conversation</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === userId;
                                    const isOptimistic = msg.id.startsWith('opt-');
                                    const isInspectionLink = msg.content?.includes('🚀 INSPECTION LINK');

                                    const isInspectionConfirmed = msg.content?.includes('✅ INSPECTION CONFIRMED');

                                    if (isInspectionLink || isInspectionConfirmed) {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-4">
                                                <div className="bg-[#BEF264] text-black p-6 rounded-3xl max-w-sm text-center shadow-lg flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-black text-[#BEF264] rounded-2xl flex items-center justify-center mb-4">
                                                        {isInspectionConfirmed ? <CheckCheck className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                                                    </div>
                                                    
                                                    {isInspectionConfirmed ? (
                                                        <h4 className="text-sm font-black uppercase tracking-tight mb-2">Inspection Confirmed ✅</h4>
                                                    ) : isMe ? (
                                                        <>
                                                            <h4 className="text-sm font-black uppercase tracking-tight mb-2">Inspection Pass Sent</h4>
                                                            <p className="text-xs font-medium opacity-70">Waiting for student to confirm & pay deposit</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <h4 className="text-sm font-black uppercase tracking-tight mb-2">Inspection Link Received</h4>
                                                            <p className="text-xs font-medium opacity-70 mb-4">Please pay the inspection fee to confirm.</p>
                                                            <Link 
                                                                href={`/pay/escrow?msg_id=${msg.id}&prop_id=${activeRoom.property?.id}&amount=2000`}
                                                                className="bg-black text-[#BEF264] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-colors inline-block"
                                                            >
                                                                Pay Inspection Fee (₦2,000)
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isOptimistic ? 'opacity-60' : ''}`}>
                                            <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm
                                                    ${isMe
                                                        ? 'bg-[#BEF264] text-black rounded-tr-none'
                                                        : 'bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-tl-none'
                                                    }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <div className="flex items-center gap-1 px-1">
                                                    <span className="text-[9px] font-bold text-gray-400">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && (
                                                        msg.is_read
                                                            ? <CheckCheck className="w-3 h-3 text-[#BEF264]" />
                                                            : <Check className="w-3 h-3 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        <div className="px-5 py-4 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-neutral-900">
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-[#BEF264] focus-within:border-transparent transition-all">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Type your reply..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 py-2"
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || sending}
                                    className="w-10 h-10 bg-[#BEF264] text-black rounded-xl flex items-center justify-center hover:bg-[#a6d456] active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
