'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, User, ChevronLeft, Loader2, Camera, Image as ImageIcon, X, Calendar, ShieldCheck, CheckCheck, Check, Tag, ShoppingCart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { MarketCheckout } from '@/components/market/MarketCheckout';
import { processCustomOffer } from '@/app/actions/escrow';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    conversation_id?: string;
    room_id?: string;
    content: string;
    image_url?: string;
    created_at: string;
    isError?: boolean;
    errorDetails?: string;
}

const CustomOfferCard = ({ msg, isMine, receiverName, payingOffer, handleOfferPayment }: { msg: Message, isMine: boolean, receiverName: string, payingOffer: string | null, handleOfferPayment: (msgId: string, payloadStr: string) => void }) => {
    const isOfferPaid = msg.content.startsWith('[OFFER_PAID]:::');
    const payloadStr = msg.content.replace('[CUSTOM_OFFER_PAYLOAD]:::', '').replace('[OFFER_PAID]:::', '');
    let payload: any = {};
    try { payload = JSON.parse(payloadStr); } catch (e) {}

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (isOfferPaid || !payload.expiresAt) return;
        
        const updateTimer = () => {
            const now = Date.now();
            const expires = new Date(payload.expiresAt).getTime();
            const diff = expires - now;
            setTimeLeft(diff > 0 ? diff : 0);
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isOfferPaid, payload.expiresAt]);

    const isExpired = timeLeft !== null && timeLeft <= 0 && !isOfferPaid;
    
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex justify-center my-6 w-full">
            <div className={`bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-gray-900 dark:text-white p-6 rounded-3xl max-w-sm w-full shadow-lg flex flex-col relative overflow-hidden ${isExpired ? 'opacity-70 grayscale' : ''}`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#BEF264] to-[#0D9488]" />
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#BEF264]/10 rounded-xl flex items-center justify-center text-[#BEF264]">
                        <Tag className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest">{isMine ? 'You' : receiverName} sent an offer</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[200px]">{payload.description}</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-4 flex flex-col gap-2 border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Base Price</span>
                        <span className="text-sm font-black text-gray-600 dark:text-gray-300">₦{Number(payload.price).toLocaleString()}</span>
                    </div>
                    {payload.escrowFee !== undefined && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Escrow Fee</span>
                            <span className="text-sm font-black text-gray-600 dark:text-gray-300">₦{Number(payload.escrowFee).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="h-[1px] w-full bg-neutral-200 dark:bg-white/10 my-1" />
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Agreed</span>
                        <span className="text-xl font-black">₦{Number(payload.totalAmount || payload.price).toLocaleString()}</span>
                    </div>
                </div>
                
                {isOfferPaid ? (
                    <button disabled className="w-full bg-neutral-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 font-black py-3 rounded-xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                        <CheckCheck className="w-4 h-4" />
                        Offer Paid ✅
                    </button>
                ) : isExpired ? (
                    <button disabled className="w-full bg-red-100 dark:bg-red-900/30 text-red-500 font-black py-3 rounded-xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50">
                        <X className="w-4 h-4" />
                        Offer Expired
                    </button>
                ) : isMine ? (
                    <div className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest flex flex-col gap-1 items-center">
                        <span>Waiting for buyer to pay</span>
                        {timeLeft !== null && <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mt-1 border border-amber-500/20">{formatTime(timeLeft)}</span>}
                    </div>
                ) : (
                    <button 
                        onClick={() => handleOfferPayment(msg.id, payloadStr)}
                        disabled={payingOffer === msg.id}
                        className="w-full bg-[#BEF264] text-black font-black py-3 rounded-xl uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {payingOffer === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>PAY ₦{Number(payload.totalAmount || payload.price).toLocaleString()} {timeLeft !== null && <span className="opacity-70 ml-1">({formatTime(timeLeft)})</span>}</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export function PrivateChat({ receiverId }: { receiverId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [receiverName, setReceiverName] = useState('User');
    const [receiverAvatar, setReceiverAvatar] = useState<string | null>(null);
    const [receiverRole, setReceiverRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const cId = searchParams.get('conversationId');
    const pId = searchParams.get('propertyId');

    const [context, setContext] = useState<any>(null);
    const [conversationId, setConversationId] = useState<string | null>(searchParams.get('conversationId'));
    const [roomId, setRoomId] = useState<string | null>(searchParams.get('room_id'));
    const [propertyId, setPropertyId] = useState<string | null>(searchParams.get('propertyId'));
    const [detectedCols, setDetectedCols] = useState<string>('');

    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showMarketCheckout, setShowMarketCheckout] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');
    const [offerDescription, setOfferDescription] = useState('');
    const [processingOffer, setProcessingOffer] = useState(false);
    const [payingOffer, setPayingOffer] = useState<string | null>(null);

    // Strict URL param sanitization
    const sanitizeId = (id: string | null) => {
        if (!id || id === 'null' || id === 'undefined' || id.trim() === '') return null;
        return id;
    };

    useEffect(() => {
        setConversationId(sanitizeId(searchParams.get('conversationId')));
        setRoomId(sanitizeId(searchParams.get('room_id')));
        setPropertyId(sanitizeId(searchParams.get('propertyId')));
    }, [searchParams]);

    useEffect(() => {
        let channel: any;

        async function setup() {
            setMessages([]); // Clear previous messages to isolate state between chats
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Fetch receiver's name and avatar across all account types
            const [
                { data: profile },
                { data: student },
                { data: agent },
                { data: landlord }
            ] = await Promise.all([
                supabase.from('profiles').select('full_name, avatar_url, account_type').eq('id', receiverId).single(),
                supabase.from('student_accounts').select('full_name, avatar_url').eq('id', receiverId).single(),
                supabase.from('agent_accounts').select('full_name, avatar_url').eq('id', receiverId).single(),
                supabase.from('landlord_accounts').select('business_name, logo_url').eq('id', receiverId).single()
            ]);

            const receiver = profile || student || agent || landlord;
            if (receiver) {
                setReceiverName(receiver.full_name || receiver.business_name || 'User');
                setReceiverAvatar(receiver.avatar_url || receiver.logo_url || null);
            }
            if (profile?.account_type) {
                setReceiverRole(profile.account_type);
            } else if (landlord) {
                setReceiverRole('landlord');
            } else if (agent) {
                setReceiverRole('agent');
            } else if (student) {
                setReceiverRole('student');
            }

            let targetId = sanitizeId(roomId) || sanitizeId(conversationId);

            // 1. Ensure we have a targetId. If not, try to find an existing room.
            if (!targetId) {
                const { data: existingRoom } = await supabase.from('chat_rooms')
                    .select('id')
                    .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${receiverId}),and(participant_one_id.eq.${receiverId},participant_two_id.eq.${user.id})`)
                    .maybeSingle();

                if (existingRoom) {
                    targetId = existingRoom.id;
                    setRoomId(targetId);
                }
            }

            // 2. Fetch context information (optional)
            const urlItemId = searchParams.get('item_id');
            const urlItemTitle = searchParams.get('item_title');
            const urlItemPrice = searchParams.get('item_price');

            if (urlItemId && urlItemTitle && urlItemPrice) {
                setContext({ 
                    type: 'market', 
                    category: 'COMMUNITY',
                    data: {
                        id: urlItemId,
                        title: urlItemTitle,
                        price: Number(urlItemPrice),
                        seller_id: receiverId,
                        image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=200&auto=format&fit=crop'
                    }
                });
                
                // Optimistically fetch full details to get true image and status
                supabase.from('market_listings').select('id, title, image_url, price, status, seller_id').eq('id', urlItemId).single()
                    .then(({ data }: { data: any }) => {
                        if (data) setContext({ type: 'market', data, category: 'COMMUNITY' });
                    });
            } else if (targetId) {
                const { data: roomData } = await supabase.from('chat_rooms').select('*').eq('id', targetId).maybeSingle();
                if (roomData) {
                    const otherId = roomData.participant_one_id === user.id ? roomData.participant_two_id : roomData.participant_one_id;
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', otherId).single();
                    
                    if (roomData.category === 'HOUSING' && roomData.property_id) {
                        const { data: property } = await supabase.from('properties').select('*').eq('id', roomData.property_id).single();
                        setContext({ type: 'property', data: property || { title: 'Unknown Property' }, category: roomData.category });
                    } else if (roomData.market_item_id) {
                        const { data: item } = await supabase.from('market_listings').select('id, title, image_url, price, status, seller_id').eq('id', roomData.market_item_id).single();
                        if (item) setContext({ type: 'market', data: item, category: 'COMMUNITY' });
                    } else {
                        setContext({ type: 'roommate', data: profile || receiver, category: roomData.category });
                    }
                } else {
                    const { data: convData } = await supabase.from('conversations').select('*').eq('id', targetId).maybeSingle();
                    if (convData) {
                        const itemId = convData.item_id;
                        const propId = convData.property_id;
                        const contextType = convData.context_type;
                        const category = convData.category || ([ 'roommate', 'market' ].includes(contextType) ? 'COMMUNITY' : 'HOUSING');
                        
                        if (itemId) {
                            const { data: item } = await supabase.from('market_listings').select('id, title, image_url, price, status, seller_id').eq('id', itemId).single();
                            if (item) setContext({ type: 'market', data: item, category });
                        } else if (propId) {
                            const { data: property } = await supabase.from('properties').select('title, images, price, location').eq('id', propId).single();
                            if (property) setContext({ type: 'property', data: property, category });
                        }
                    }
                }
            }

            console.log('--- CHAT DEBUG START ---');
            console.log('Current User:', user.id);
            console.log('Receiver:', receiverId);
            console.log('Resolved Room ID:', targetId);

            // 3. Fetch messages (room_id OR conversation_id match)
            let finalMessages: any[] = [];
            if (targetId) {
                // Fetch messages matching ANY of the room ID columns
                const { data: messagesRes, error: messagesErr } = await supabase.from('messages')
                    .select('*')
                    .or(`room_id.eq.${targetId},conversation_id.eq.${targetId},room.eq.${targetId},ROOM_ID.eq.${targetId}`)
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: true });

                if (!messagesErr && messagesRes && messagesRes.length > 0) {
                    finalMessages = messagesRes;
                }

                // Last resort: direct participant match with no room/conv id 
                if (finalMessages.length === 0) {
                    const { data: directRes } = await supabase.from('messages')
                        .select('*')
                        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
                        .order('created_at', { ascending: true });
                    if (directRes && directRes.length > 0) finalMessages = directRes;
                }
            } else {
                // Direct messages without a room
                const { data: directRes } = await supabase.from('messages')
                    .select('*')
                    .is('room_id', null)
                    .is('conversation_id', null)
                    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
                    .order('created_at', { ascending: true });
                finalMessages = directRes || [];
            }

            if (finalMessages) {
                // Normalize keys to lowercase for the UI
                const normalized = finalMessages.map((m: any) => ({
                    id: m.id,
                    content: m.content,
                    sender_id: m.sender_id,
                    receiver_id: m.receiver_id,
                    room_id: m.room_id || m.conversation_id || m.room || m.ROOM_ID,
                    created_at: m.created_at,
                    image_url: m.image_url
                }));
                setMessages(normalized);
            }
            setLoading(false);
            scrollToBottom();
            console.log('--- CHAT DEBUG END ---');
            
            // Subscribe to real-time changes
            // We set the filter to undefined to catch ALL messages authorized by RLS.
            // Client-side filtering ensures we only display the ones relevant to this chat.
            const channelId = targetId ? `room_${targetId}` : `direct_${user.id}_${receiverId}`;
            const filterCondition = undefined;

            channel = supabase
                .channel(channelId)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: filterCondition
                }, (payload: any) => {
                    const newMessage = payload.new as any;
                    
                    // Normalize the new message keys
                    const normalizedMsg = {
                        id: newMessage.id,
                        content: newMessage.content,
                        sender_id: newMessage.sender_id,
                        receiver_id: newMessage.receiver_id,
                        room_id: newMessage.room_id,
                        conversation_id: newMessage.conversation_id,
                        created_at: newMessage.created_at,
                        image_url: newMessage.image_url
                    };

                    // Even with server-side filtering, apply a strict sanity check client-side
                    let isRelevant = false;
                    const mRoomId = newMessage.room_id || newMessage.conversation_id || newMessage.room || newMessage.ROOM_ID;
                    
                    if (targetId) {
                        isRelevant = mRoomId === targetId;
                    } else {
                        const sId = newMessage.sender_id;
                        const rId = newMessage.receiver_id;
                        const noRoom = !mRoomId;
                        isRelevant = noRoom && ((sId === user.id && rId === receiverId) || (sId === receiverId && rId === user.id));
                    }

                    if (isRelevant) {
                        setMessages((prev) => {
                            if (prev.find(m => m.id === normalizedMsg.id)) return prev;
                            return [...prev, normalizedMsg];
                        });
                        scrollToBottom();
                    }
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: filterCondition
                }, (payload: any) => {
                    const updatedMessage = payload.new as any;
                    setMessages(prev => prev.map(m => m.id === updatedMessage.id ? { ...m, content: updatedMessage.content, is_read: updatedMessage.is_read } : m));
                })
                .subscribe((status: any) => {
                    console.log(`Realtime Subscription Status for ${channelId}:`, status);
                    if (status === 'SUBSCRIBED') {
                        console.log('Successfully listening to Pulse!');
                    }
                });
            
            // Mark as read
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('receiver_id', user.id)
                .eq('sender_id', receiverId)
                .eq('is_read', false);
        }

        setup();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [supabase, receiverId, conversationId, roomId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    const calculateEscrowFee = (amount: number) => {
        if (!amount || amount <= 0) return 0;
        if (amount > 50000) return 1000;
        if (amount <= 10000) return 500;
        return Math.floor(amount * 0.025);
    };

    const sendCustomOffer = async () => {
        if (!offerPrice || !userId) return;
        setProcessingOffer(true);
        const price = Number(offerPrice);
        const escrowFee = calculateEscrowFee(price);
        const totalAmount = price + escrowFee;
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        
        const payload = JSON.stringify({
            price,
            escrowFee,
            totalAmount,
            description: offerDescription,
            itemId: context?.data?.id || receiverId,
            expiresAt
        });
        const content = `[CUSTOM_OFFER_PAYLOAD]:::${payload}`;

        try {
            let targetId = roomId || conversationId;
            if (!targetId) {
                const { data: existingRoom } = await supabase.from('chat_rooms')
                    .select('id')
                    .or(`and(participant_one_id.eq.${userId},participant_two_id.eq.${receiverId}),and(participant_one_id.eq.${receiverId},participant_two_id.eq.${userId})`)
                    .maybeSingle();

                if (existingRoom) {
                    targetId = existingRoom.id;
                    setRoomId(targetId);
                } else {
                    const { data: newRoom } = await supabase.from('chat_rooms')
                        .insert({ participant_one_id: userId, participant_two_id: receiverId, category: context?.category || 'COMMUNITY', market_item_id: context?.type === 'market' ? context.data.id : null })
                        .select().single();
                    if (newRoom) {
                        targetId = newRoom.id;
                        setRoomId(targetId);
                    }
                }
            }

            const { data, error } = await supabase.from('messages')
                .insert({
                    content,
                    sender_id: userId,
                    receiver_id: receiverId,
                    room_id: targetId,
                    is_read: false
                })
                .select().single();

            if (error) throw error;
            toast.success('Custom offer sent successfully.');
            setShowOfferModal(false);
            setOfferPrice('');
            setOfferDescription('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send offer');
        } finally {
            setProcessingOffer(false);
        }
    };

    const handleOfferPayment = async (msgId: string, payloadStr: string) => {
        setPayingOffer(msgId);
        try {
            const payload = JSON.parse(payloadStr);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in.');

            const res = await processCustomOffer(payload.id || msgId, payload.totalAmount || payload.price, receiverId, user.id);
            if (res.error) throw new Error(res.error);

            // Update message to paid
            const newContent = `[OFFER_PAID]:::${payloadStr}`;
            await supabase.from('messages').update({ content: newContent }).eq('id', msgId);
            toast.success('Custom Offer Paid Successfully!');

        } catch (error: any) {
            toast.error(error.message || 'Payment failed');
        } finally {
            setPayingOffer(null);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !selectedImage) || !userId) return;

        const optimisticId = `temp-${Date.now()}`;
        const content = input;
        setInput('');
        const previewUrl = imagePreview;
        setSelectedImage(null);
        setImagePreview(null);

        // Optimistic update
        const optimisticMsg: Message = {
            id: optimisticId,
            sender_id: userId,
            receiver_id: receiverId,
            conversation_id: conversationId || undefined,
            content: content,
            image_url: previewUrl || undefined,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        let imageUrl = '';
        if (selectedImage) {
            setUploading(true);
            const fileExt = selectedImage.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `chat-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('market-images')
                .upload(filePath, selectedImage);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                setUploading(false);
                // Remove optimistic message on error or show error state
                setMessages(prev => prev.filter(m => m.id !== optimisticId));
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('market-images')
                .getPublicUrl(filePath);
            
            imageUrl = publicUrl;
        }

        try {
            let targetId = roomId || conversationId;
            const category = searchParams.get('category') || 'COMMUNITY';
            
            // --- 2. INITIALIZE ROOM (IF MISSING) ---
            if (!targetId) {
                console.log('INITIALIZING ROOM...');
                // Try to find an existing room between these two participants
                const { data: existingRoom } = await supabase.from('chat_rooms')
                    .select('id')
                    .or(`and(participant_one_id.eq.${userId},participant_two_id.eq.${receiverId}),and(participant_one_id.eq.${receiverId},participant_two_id.eq.${userId})`)
                    .maybeSingle();

                if (existingRoom) {
                    targetId = existingRoom.id;
                    setRoomId(targetId);
                } else {
                    // Create a new room with category
                    const { data: newRoom, error: roomError } = await supabase.from('chat_rooms')
                        .insert({
                            participant_one_id: userId,
                            participant_two_id: receiverId,
                            property_id: propertyId || null,
                            category: category,
                            market_item_id: context?.type === 'market' ? context.data.id : null,
                            last_message_at: new Date().toISOString()
                        })
                        .select()
                        .single();

                    if (roomError) throw roomError;
                    targetId = newRoom.id;
                    setRoomId(targetId);
                }
            }

            // --- 3. QUANTUM INSERT (STRICT room_id & conversation_id) ---
            const insertAttempts = [
                { room_id: targetId, conversation_id: targetId }, // Primary: Include BOTH for cross-dashboard compatibility
                { room_id: targetId }, // Fallback 1
                { conversation_id: targetId }, // Fallback 2
                { room: targetId },    // Secondary: New generic column
                {} // Fallback
            ];

            let lastError: any = null;
            let finalMsg: any = null;

            for (const attempt of insertAttempts) {
                const cleanData: any = {
                    content,
                    sender_id: userId,
                    receiver_id: receiverId,
                    property_id: propertyId || null,
                    image_url: imageUrl || null,
                    is_read: false,
                    ...attempt
                };
                
                console.log(`QUANTUM ATTEMPT:`, Object.keys(attempt).join('/') || 'Naked Insert');
                
                const { data, error } = await supabase.from('messages')
                    .insert(cleanData)
                    .select()
                    .maybeSingle();

                if (!error && data) {
                    finalMsg = data;
                    
                    // Update Pulse (last_message_at)
                    if (targetId) {
                        await supabase.from('chat_rooms').update({ last_message_at: new Date().toISOString() }).eq('id', targetId);
                        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', targetId);
                    }
                    break;
                } else {
                    lastError = error;
                    console.log(`ATTEMPT FAILED:`, error?.message);
                    if (error && !error.message.includes('foreign key') && !error.message.includes('column')) break;
                }
            }

            if (!finalMsg) throw lastError || new Error('All insertion attempts failed');
            const realMsg = finalMsg;

            if (realMsg) {
                setMessages(prev => {
                    const exists = prev.find(m => m.id === realMsg.id);
                    if (exists) return prev.filter(m => m.id !== optimisticId);
                    return prev.map(m => m.id === optimisticId ? realMsg : m);
                });
            } else {
                setMessages(prev => prev.map(m => m.id === optimisticId ? { ...m, id: `saved-${Date.now()}` } : m));
            }
        } catch (error: any) {
            console.error('CRITICAL MESSAGE ERROR:', error);
            // Dump the RAW error to the screen so we can read it in the screenshot
            const detailedError = JSON.stringify(error, null, 2);
            toast.error(`Blocked: ${error?.message || 'Check red bubble'}`);
            
            setMessages(prev => prev.map(m => m.id === optimisticId ? { 
                ...m, 
                id: `error-${Date.now()}`, 
                error: true,
                errorDetails: detailedError 
            } : m));
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-[#BEF264] animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 overflow-hidden shadow-xl relative">
            {/* Header */}
            <div className="px-8 py-6 border-b border-neutral-100 dark:border-white/5 flex items-center gap-4 bg-gray-50/50 dark:bg-neutral-800/30">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white dark:hover:bg-neutral-700 rounded-xl transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 bg-[#BEF264]/10 dark:bg-[#BEF264]/5 rounded-full flex items-center justify-center text-[#BEF264] overflow-hidden relative shrink-0">
                    {receiverAvatar ? (
                        <NextImage src={receiverAvatar} alt={receiverName} fill className="object-cover" />
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                </div>
                <div>
                    <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">
                        {receiverName}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Online</p>
                </div>
            </div>

            {/* Sticky Context Sub-Header */}
            {context && (
                <div className="bg-[#BEF264]/10 dark:bg-[#BEF264]/5 border-b border-[#BEF264]/20 px-8 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white dark:bg-neutral-800 rounded-full overflow-hidden relative shadow-sm border border-white/10 shrink-0">
                            {context.type === 'market' ? (
                                <NextImage src={context.data.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=200&auto=format&fit=crop'} alt={context.data.title} fill className="object-cover" />
                            ) : context.type === 'property' ? (
                                <NextImage src={(context.data.images && context.data.images[0]) || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=200&auto=format&fit=crop'} alt={context.data.title} fill className="object-cover" />
                            ) : (
                                <NextImage src={context.data.avatar_url || ''} alt={context.data.full_name} fill className="object-cover" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                Discussing: {context.type === 'market' || context.type === 'property' ? context.data.title : context.data.full_name.split(' ')[0]} 
                                {context.type !== 'roommate' && ` — ₦${Number(context.data.price).toLocaleString()}`}
                            </p>
                            {context.type === 'market' && context.data.status === 'sold' && (
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-0.5">Sold Out</p>
                            )}
                        </div>
                    </div>
                    {context.type === 'market' && context.data.status !== 'sold' && (
                        <div className="flex items-center gap-2">
                            {context.data.seller_id === userId ? (
                                <button 
                                    onClick={() => setShowOfferModal(true)}
                                    className="bg-[#BEF264] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all flex items-center gap-1"
                                >
                                    <Tag size={12} />
                                    Create Custom Offer
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setShowMarketCheckout(true)}
                                    className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all flex items-center gap-1"
                                >
                                    <ShoppingCart size={12} />
                                    Buy at Original Price
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4">
                {messages.map((msg) => {
                    const isMine = msg.sender_id === userId;
                    const isOptimistic = msg.id.startsWith('temp-');
                    const isInspectionLink = msg.content.includes('🚀 INSPECTION LINK');
                    const isSystemMessage = msg.content.startsWith('✅');
                    const isCustomOffer = msg.content.startsWith('[CUSTOM_OFFER_PAYLOAD]:::');
                    const isOfferPaid = msg.content.startsWith('[OFFER_PAID]:::');

                    if (isCustomOffer || isOfferPaid) {
                        const payloadStr = msg.content.replace('[CUSTOM_OFFER_PAYLOAD]:::', '').replace('[OFFER_PAID]:::', '');
                        let payload: any = {};
                        try { payload = JSON.parse(payloadStr); } catch (e) {}

                        return (
                            <CustomOfferCard 
                                key={msg.id}
                                msg={msg} 
                                isMine={isMine} 
                                receiverName={receiverName} 
                                payingOffer={payingOffer} 
                                handleOfferPayment={handleOfferPayment} 
                            />
                        );
                    }

                    const isInspectionConfirmed = msg.content.includes('✅ INSPECTION CONFIRMED');

                    if (isInspectionLink || isInspectionConfirmed) {
                        return (
                            <div key={msg.id} className="flex justify-center my-6">
                                <div className="bg-[#BEF264] text-black p-8 rounded-[2.5rem] max-w-md text-center shadow-2xl border-4 border-black/5 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-black text-[#BEF264] rounded-2xl flex items-center justify-center mb-6">
                                        {isInspectionConfirmed ? <CheckCheck className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                                    </div>
                                    
                                    {isInspectionConfirmed ? (
                                        <h4 className="text-xl font-black uppercase tracking-tighter mb-4 leading-tight">Inspection Confirmed ✅</h4>
                                    ) : isMine ? (
                                        <>
                                            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 leading-tight">Inspection Pass Sent</h4>
                                            <div className="bg-black/10 text-black/60 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest w-full">
                                                Waiting for student to confirm & pay deposit
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 leading-tight">Inspection Link Received</h4>
                                            <Link 
                                                href={`/pay/escrow?msg_id=${msg.id}&prop_id=${propertyId}&amount=2000`}
                                                className="bg-black text-[#BEF264] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all w-full shadow-xl"
                                            >
                                                Pay Inspection Fee (₦2,000)
                                            </Link>
                                        </>
                                    )}
                                    
                                    {!isInspectionConfirmed && (
                                        <p className="mt-6 text-[8px] font-black uppercase tracking-widest text-black/40">
                                            🛡️ HOSTELPULSE Guarantee: This ₦2,000 is held in escrow. If the agent doesn't show up, you get an instant refund.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    if (isSystemMessage) {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-6 py-3 rounded-2xl flex items-center gap-3">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{msg.content}</span>
                                </div>
                            </div>
                        );
                    }

                    const isError = msg.id.startsWith('error-');

                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isOptimistic ? 'opacity-70' : ''} ${isError ? 'opacity-100' : ''}`}>
                            <div className={`
                                max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-2
                            `}>
                                <div className={`
                                    p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-xl relative
                                    ${isMine 
                                        ? isError ? 'bg-red-500 text-white' : 'bg-[#BEF264] text-black rounded-tr-none' 
                                        : 'bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/5 rounded-tl-none'
                                    }
                                `}>
                                    {isError && (
                                        <div className="absolute -top-2 -right-2 bg-black text-white text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border border-red-500">
                                            Failed
                                        </div>
                                    )}
                                    {isError && msg.errorDetails && (
                                        <div className="mb-2 p-2 bg-black/50 rounded-lg font-mono text-[8px] text-white overflow-x-auto max-w-full">
                                            {msg.errorDetails}
                                        </div>
                                    )}
                                    {msg.image_url && (
                                        <div className="mb-4 rounded-2xl overflow-hidden relative aspect-video w-[280px] sm:w-[400px] bg-neutral-200 dark:bg-neutral-800">
                                            <NextImage 
                                                src={msg.image_url} 
                                                alt="Chat Image" 
                                                fill 
                                                className="object-cover"
                                                onClick={() => window.open(msg.image_url, '_blank')}
                                                unoptimized={msg.image_url.startsWith('data:')}
                                            />
                                        </div>
                                    )}
                                    {msg.content && <span>{msg.content}</span>}
                                </div>
                                <div className="flex items-center gap-2 px-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Image Preview Overlay */}
            {imagePreview && (
                <div className="mx-8 mb-4 p-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden relative">
                            <NextImage src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0D9488]">Ready to send</p>
                    </div>
                    <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:scale-110 transition-all">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Create Offer Modal */}
            {showOfferModal && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border border-neutral-100 dark:border-white/5 animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowOfferModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#BEF264]/10 rounded-xl text-[#BEF264]">
                                <Tag size={20} />
                            </div>
                            <h3 className="font-black uppercase tracking-tighter text-lg">Custom Offer</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Agreed Price (₦)</label>
                                <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#BEF264] outline-none" placeholder="e.g. 15000" />
                                {offerPrice && Number(offerPrice) > 0 && (
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">Base Price</span>
                                            <span className="font-bold">₦{Number(offerPrice).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">Escrow/Service Charge</span>
                                            <span className="font-bold">₦{calculateEscrowFee(Number(offerPrice)).toLocaleString()}</span>
                                        </div>
                                        <div className="h-[1px] bg-gray-200 dark:bg-white/10 my-1" />
                                        <div className="flex justify-between text-sm">
                                            <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total Amount</span>
                                            <span className="font-black text-[#BEF264]">₦{(Number(offerPrice) + calculateEscrowFee(Number(offerPrice))).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Note / Description</label>
                                <input type="text" value={offerDescription} onChange={e => setOfferDescription(e.target.value)} className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#BEF264] outline-none" placeholder="e.g. Discounted without delivery" />
                            </div>
                            <button onClick={sendCustomOffer} disabled={!offerPrice || processingOffer} className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl mt-2 hover:scale-[1.02] transition-transform disabled:opacity-50 flex justify-center items-center">
                                {processingOffer ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Offer to Buyer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-6 border-t border-neutral-100 dark:border-white/5 flex gap-3 bg-gray-50/30 dark:bg-neutral-800/20 relative z-10">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white dark:bg-neutral-800 p-4 rounded-2xl text-gray-500 hover:text-black dark:hover:text-[#BEF264] transition-all shadow-sm border border-neutral-200 dark:border-white/5"
                >
                    <Camera size={20} />
                </button>
                {receiverRole !== 'landlord' && (
                    <button 
                        type="button"
                        onClick={() => setShowOfferModal(true)}
                        className="bg-white dark:bg-neutral-800 p-4 rounded-2xl text-gray-500 hover:text-black dark:hover:text-[#BEF264] transition-all shadow-sm border border-neutral-200 dark:border-white/5"
                        title="Create Custom Offer"
                    >
                        <Tag size={20} />
                    </button>
                )}
                <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 bg-white dark:bg-neutral-800 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-[#BEF264] outline-none transition-all shadow-sm"
                />
                <button 
                    type="submit" 
                    disabled={uploading}
                    className="bg-[#BEF264] p-4 rounded-2xl text-black hover:scale-105 transition-all shadow-lg shadow-[#BEF264]/20 disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                </button>
            </form>
            {/* Market Checkout Modal */}
            {showMarketCheckout && context?.type === 'market' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMarketCheckout(false)} />
                    <MarketCheckout 
                        item={context.data} 
                        onClose={() => setShowMarketCheckout(false)} 
                    />
                </div>
            )}
        </div>
    );
}
