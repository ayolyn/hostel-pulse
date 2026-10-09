'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, User, ChevronLeft, Loader2, Camera, Image as ImageIcon, X, Calendar, ShieldCheck, CheckCheck, Check, Tag, ShoppingCart, Wallet, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { MarketCheckout } from '@/components/market/MarketCheckout';
import { processCustomOffer, recordCardCustomOffer } from '@/app/actions/escrow';
import FlutterwaveButton from '@/components/ui/FlutterwaveButton';

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

const CustomOfferCard = ({ 
    msg, 
    isMine, 
    receiverName, 
    payingOffer, 
    onOpenPaymentModal 
}: { 
    msg: Message; 
    isMine: boolean; 
    receiverName: string; 
    payingOffer: string | null; 
    onOpenPaymentModal: (msgId: string, payload: any, payloadStr: string) => void;
}) => {
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
        <div className={`flex ${isMine ? "justify-end" : "justify-start"} my-1 w-full`}>
            <div className={`bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-gray-900 dark:text-white p-3 rounded-2xl w-full max-w-[260px] sm:max-w-[280px] shadow-sm flex flex-col relative overflow-hidden ${isExpired ? 'opacity-70 grayscale' : ''}`}>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#BEF264] to-[#0D9488]" />
                <div className="flex items-center gap-2 mb-2 mt-0.5">
                    <div className="w-6 h-6 bg-[#BEF264]/10 rounded-lg flex items-center justify-center text-[#BEF264] shrink-0">
                        <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[9px] font-black uppercase tracking-widest leading-none truncate">{isMine ? 'You' : receiverName.split(' ')[0]} sent offer</h4>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest truncate mt-0.5">{payload.description || 'Custom Offer'}</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-xl mb-2 flex flex-col gap-1 border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Base</span>
                        <span className="text-[9px] font-black text-gray-600 dark:text-gray-300">₦{Number(payload.price).toLocaleString()}</span>
                    </div>
                    {payload.escrowFee !== undefined && (
                        <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Fee</span>
                            <span className="text-[9px] font-black text-gray-600 dark:text-gray-300">₦{Number(payload.escrowFee).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="h-[1px] w-full bg-neutral-200 dark:bg-white/10 my-0.5" />
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Total</span>
                        <span className="text-[11px] font-black">₦{Number(payload.totalAmount || payload.price).toLocaleString()}</span>
                    </div>
                </div>
                
                {isOfferPaid ? (
                    <button disabled className="w-full bg-neutral-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 font-black py-2 rounded-xl uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5" />
                        Offer Paid ✅
                    </button>
                ) : isExpired ? (
                    <button disabled className="w-full bg-red-100 dark:bg-red-900/30 text-red-500 font-black py-2 rounded-xl uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 border border-red-200 dark:border-red-900/50">
                        <X className="w-3.5 h-3.5" />
                        Offer Expired
                    </button>
                ) : isMine ? (
                    <div className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest flex flex-col gap-0.5 items-center py-1">
                        <span>Waiting for buyer to pay</span>
                        {timeLeft !== null && <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mt-1 border border-amber-500/20 text-[8px] font-black">{formatTime(timeLeft)}</span>}
                    </div>
                ) : (
                    <button 
                        onClick={() => onOpenPaymentModal(msg.id, payload, payloadStr)}
                        disabled={payingOffer === msg.id}
                        className="w-full bg-[#BEF264] text-black font-black py-2.5 rounded-xl uppercase tracking-widest text-[9px] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                        {payingOffer === msg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                            <>PAY ₦{Number(payload.totalAmount || payload.price).toLocaleString()} {timeLeft !== null && <span className="opacity-70 ml-1">({formatTime(timeLeft)})</span>}</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

interface CustomOfferPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    offer: { msgId: string; payload: any; payloadStr: string };
    receiverId: string;
    receiverName: string;
    currentUser: any;
    onPaymentSuccess: (msgId: string, payloadStr: string) => void;
}

function CustomOfferPaymentModal({
    isOpen,
    onClose,
    offer,
    receiverId,
    receiverName,
    currentUser,
    onPaymentSuccess
}: CustomOfferPaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
    const [loadingWallet, setLoadingWallet] = useState(false);

    if (!isOpen || !offer) return null;

    const { msgId, payload, payloadStr } = offer;
    const basePrice = Number(payload.price || 0);
    const escrowFee = Number(payload.escrowFee || 0);
    const totalAmount = Number(payload.totalAmount || (basePrice + escrowFee));
    const walletBalance = Number(currentUser?.wallet_balance || 0);
    const hasEnoughBalance = walletBalance >= totalAmount;

    const handleWalletPay = async () => {
        if (!hasEnoughBalance) {
            toast.error('Insufficient wallet balance. Please pay via card or top up.');
            return;
        }
        setLoadingWallet(true);
        try {
            const res = await processCustomOffer(payload.id || msgId, totalAmount, receiverId, currentUser?.id);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            onPaymentSuccess(msgId, payloadStr);
        } catch (err: any) {
            toast.error(err.message || 'Payment failed');
        } finally {
            setLoadingWallet(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl relative border border-neutral-100 dark:border-white/5 animate-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose} 
                    className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors z-10 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-2.5 mb-4 pr-10">
                    <div className="p-2 bg-[#BEF264]/10 rounded-xl text-[#BEF264]">
                        <Tag size={20} />
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-base sm:text-lg text-gray-900 dark:text-white">Pay Custom Offer</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">From {receiverName}</p>
                    </div>
                </div>

                {/* Price summary */}
                <div className="space-y-2.5 mb-5 bg-gray-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate max-w-[180px]">{payload.description || 'Custom Agreed Item'}</span>
                        <span className="font-black text-gray-900 dark:text-white">₦{basePrice.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#0D9488] uppercase tracking-wider">Escrow Protection Fee</span>
                        <span className="font-bold text-[#0D9488]">₦{escrowFee.toLocaleString()}</span>
                    </div>

                    <div className="h-px bg-neutral-200 dark:bg-white/10 my-1" />

                    <div className="flex justify-between items-center pt-0.5">
                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Total to Pay</span>
                        <span className="text-xl font-black text-black dark:text-[#BEF264]">₦{totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                            paymentMethod === 'wallet'
                                ? 'border-[#BEF264] bg-[#BEF264]/10 text-gray-900 dark:text-white'
                                : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-[#BEF264]/50'
                        }`}
                    >
                        <Wallet className={`w-4 h-4 mb-1 ${paymentMethod === 'wallet' ? 'text-[#BEF264]' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Wallet Balance</span>
                        <span className="text-[9px] font-bold text-gray-400 mt-0.5">₦{walletBalance.toLocaleString()}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                            paymentMethod === 'card'
                                ? 'border-[#BEF264] bg-[#BEF264]/10 text-gray-900 dark:text-white'
                                : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-[#BEF264]/50'
                        }`}
                    >
                        <ShieldCheck className={`w-4 h-4 mb-1 ${paymentMethod === 'card' ? 'text-[#BEF264]' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Card / Bank</span>
                        <span className="text-[9px] font-bold text-emerald-500 mt-0.5">Instant Escrow</span>
                    </button>
                </div>

                {/* Protection notice */}
                <div className="bg-[#BEF264]/5 border border-[#BEF264]/20 p-3 rounded-xl mb-4 flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#BEF264] shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-snug font-medium">
                        Funds are safely locked in Escrow until you inspect and accept delivery.
                    </p>
                </div>

                {/* Payment button / Flutterwave */}
                {paymentMethod === 'wallet' ? (
                    <div>
                        {!hasEnoughBalance && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl mb-3 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                                    Insufficient wallet balance (₦{walletBalance.toLocaleString()}). Select Card / Bank above to pay directly.
                                </p>
                            </div>
                        )}
                        <button
                            onClick={handleWalletPay}
                            disabled={loadingWallet || !hasEnoughBalance}
                            className="w-full bg-[#BEF264] text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#BEF264]/10"
                        >
                            {loadingWallet ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <Wallet className="w-4 h-4" />
                                    <span>Pay ₦{totalAmount.toLocaleString()} from Wallet</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div>
                        <FlutterwaveButton
                            amount={totalAmount}
                            customerEmail={currentUser?.contact_email || currentUser?.email || 'buyer@hostelpulse.app'}
                            customerName={currentUser?.full_name || 'HostelPulse Buyer'}
                            customerPhone={currentUser?.phone || ''}
                            hostelName={payload.description || 'Custom Offer'}
                            meta={{
                                type: 'market',
                                listing_id: payload.itemId || null,
                                seller_id: receiverId,
                                payer_id: currentUser?.id,
                                is_custom_offer: true,
                                offer_id: msgId
                            }}
                            label={`Pay ₦${totalAmount.toLocaleString()} via Card`}
                            className="w-full bg-[#BEF264] text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-[#a6d456] active:scale-[0.98] transition-all shadow-xl"
                            onSuccess={async (tx_ref, amount, flw_id) => {
                                try {
                                    await recordCardCustomOffer(msgId, tx_ref, String(flw_id), amount, receiverId, currentUser?.id, payload);
                                    onPaymentSuccess(msgId, payloadStr);
                                } catch (e: any) {
                                    toast.error(e.message || 'Error confirming card offer');
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

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
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [selectedOfferForPay, setSelectedOfferForPay] = useState<{ msgId: string; payload: any; payloadStr: string } | null>(null);

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

            const { data: myProfile } = await supabase.from('profiles').select('id, full_name, contact_email, phone, wallet_balance').eq('id', user.id).single();
            if (myProfile) {
                setCurrentUserProfile(myProfile);
            } else {
                setCurrentUserProfile({ id: user.id, contact_email: user.email, full_name: user.user_metadata?.full_name || 'Buyer' });
            }

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

                        if (normalizedMsg.receiver_id === user.id) {
                            supabase.from('messages').update({ is_read: true }).eq('id', normalizedMsg.id).then();
                        }
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
            if (finalMessages && finalMessages.length > 0) {
                const unreadMsgIds = finalMessages.filter((m: any) => m.receiver_id === user.id && m.is_read !== true).map((m: any) => m.id);
                if (unreadMsgIds.length > 0) {
                    await supabase
                        .from('messages')
                        .update({ is_read: true })
                        .in('id', unreadMsgIds);
                }
            }
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
        if (amount < 20000) return 500;
        if (amount > 50000) return Math.floor(amount * 0.025);
        return 1000;
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

    const handleOfferPaidSuccess = async (msgId: string, payloadStr: string) => {
        try {
            const newContent = `[OFFER_PAID]:::${payloadStr}`;
            await supabase.from('messages').update({ content: newContent }).eq('id', msgId);
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: newContent } : m));
            toast.success('Custom Offer Paid Successfully! 🎉');
            setSelectedOfferForPay(null);
            if (userId) {
                const { data: updatedProf } = await supabase.from('profiles').select('id, full_name, contact_email, phone, wallet_balance').eq('id', userId).single();
                if (updatedProf) setCurrentUserProfile(updatedProf);
            }
        } catch (err: any) {
            console.error('Failed to update offer message status:', err);
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

            await handleOfferPaidSuccess(msgId, payloadStr);
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
            <div className="px-4 py-3 border-b border-neutral-100 dark:border-white/5 flex items-center gap-4 bg-gray-50/50 dark:bg-neutral-800/30">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white dark:hover:bg-neutral-700 rounded-xl transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 bg-[#BEF264]/10 dark:bg-[#BEF264]/5 rounded-full flex items-center justify-center text-[#BEF264] overflow-hidden relative shrink-0">
                    {receiverAvatar && receiverAvatar.trim() !== '' ? (
                        <NextImage src={receiverAvatar} alt={receiverName} fill className="object-cover" onError={() => setReceiverAvatar(null)} />
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
                <div className="bg-[#BEF264]/10 dark:bg-[#BEF264]/5 border-b border-[#BEF264]/20 px-4 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white dark:bg-neutral-800 rounded-full overflow-hidden relative shadow-sm border border-white/10 shrink-0">
                            {context.type === 'market' ? (
                                <NextImage src={context.data.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=200&auto=format&fit=crop'} alt={context.data.title} fill className="object-cover" />
                            ) : context.type === 'property' ? (
                                <NextImage src={(context.data.images && context.data.images[0]) || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=200&auto=format&fit=crop'} alt={context.data.title} fill className="object-cover" />
                            ) : (
                                <NextImage src={context.data.avatar_url || ''} alt={context.data.full_name} fill className="object-cover" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                Discussing: {context.type === 'market' || context.type === 'property' ? context.data.title : context.data.full_name?.split(' ')[0]} 
                                {context.type !== 'roommate' && ` — ₦${Number(context.data.price).toLocaleString()}`}
                            </p>
                            {context.type === 'market' && context.data.status === 'sold' && (
                                <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest mt-0.5">Sold Out</p>
                            )}
                        </div>
                    </div>
                    {context.type === 'market' && context.data.status !== 'sold' && (
                        <div className="flex items-center gap-2">
                            {context.data.seller_id === userId ? (
                                <button 
                                    onClick={() => setShowOfferModal(true)}
                                    className="bg-[#BEF264] text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all flex items-center gap-1"
                                >
                                    <Tag size={12} />
                                    Create Custom Offer
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setShowMarketCheckout(true)}
                                    className="bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all flex items-center gap-1"
                                >
                                    <ShoppingCart size={12} />
                                    Buy at Original Price
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Safety Tip Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-900/50 px-4 py-3 flex items-start gap-3 shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-1">Safety Tip</h4>
                    <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400/90 font-medium leading-snug">
                        HostelPulse will <strong className="font-black">NEVER</strong> ask you to pay into a personal bank account or meet a landlord in a secluded area. Always pay through the app for your safety.
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
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
                                onOpenPaymentModal={(id, p, ps) => setSelectedOfferForPay({ msgId: id, payload: p, payloadStr: ps })} 
                            />
                        );
                    }

                    const isInspectionConfirmed = msg.content.includes('✅ INSPECTION CONFIRMED');

                    if (isInspectionLink || isInspectionConfirmed) {
                        const effectivePropId = propertyId || searchParams.get('item_id') || context?.data?.id || '';

                        return (
                            <div key={msg.id} className="flex justify-center my-6">
                                <div className="bg-[#BEF264] text-black p-5 rounded-[2.5rem] max-w-md text-center shadow-2xl border-4 border-black/5 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-black text-[#BEF264] rounded-2xl flex items-center justify-center mb-6">
                                        {isInspectionConfirmed ? <CheckCheck className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                                    </div>
                                    
                                    {isInspectionConfirmed ? (
                                        <h4 className="text-xl font-black uppercase tracking-tighter mb-4 leading-tight">Inspection Confirmed ✅</h4>
                                    ) : isMine ? (
                                        <>
                                            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 leading-tight">Inspection Pass Sent</h4>
                                            <div className="bg-black/10 text-black/60 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest w-full">
                                                Waiting for student to confirm & pay deposit
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 leading-tight">Inspection Link Received</h4>
                                            <Link 
                                                href={`/pay/escrow?msg_id=${msg.id}&prop_id=${effectivePropId}&amount=2000`}
                                                className="bg-black text-[#BEF264] px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all w-full shadow-xl"
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
                                    px-4 py-2 rounded-[1.2rem] text-[13px] font-medium leading-snug shadow-sm relative
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl relative border border-neutral-100 dark:border-white/5 animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowOfferModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#BEF264]/10 rounded-xl text-[#BEF264]">
                                <Tag size={20} />
                            </div>
                            <h3 className="font-black uppercase tracking-tighter text-base sm:text-lg">Custom Offer</h3>
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
                            <button onClick={sendCustomOffer} disabled={!offerPrice || processingOffer} className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest text-[10px] py-3 rounded-xl mt-2 hover:scale-[1.02] transition-transform disabled:opacity-50 flex justify-center items-center">
                                {processingOffer ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Offer to Buyer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={sendMessage} className="px-4 py-3 border-t border-neutral-100 dark:border-white/5 flex items-center bg-gray-50/30 dark:bg-neutral-800/20 relative z-10">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <div className="flex flex-1 items-center bg-white dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-white/5 px-2 py-1.5 shadow-sm">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-black dark:hover:text-[#BEF264] transition-colors"
                    >
                        <Camera size={20} />
                    </button>
                    {receiverRole !== 'landlord' && (
                        <button 
                            type="button"
                            onClick={() => setShowOfferModal(true)}
                            className="p-2 text-gray-400 hover:text-black dark:hover:text-[#BEF264] transition-colors"
                            title="Create Custom Offer"
                        >
                            <Tag size={20} />
                        </button>
                    )}
                    <input 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..." 
                        className="flex-1 bg-transparent border-none px-2 text-[13px] font-medium focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
                    />
                    <button 
                        type="submit" 
                        disabled={uploading}
                        className="bg-[#BEF264] p-2.5 rounded-full text-black hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center shrink-0 ml-1"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} className="-ml-0.5" />}
                    </button>
                </div>
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

            {/* Custom Offer Payment Modal */}
            {selectedOfferForPay && (
                <CustomOfferPaymentModal
                    isOpen={Boolean(selectedOfferForPay)}
                    onClose={() => setSelectedOfferForPay(null)}
                    offer={selectedOfferForPay}
                    receiverId={receiverId}
                    receiverName={receiverName}
                    currentUser={currentUserProfile}
                    onPaymentSuccess={handleOfferPaidSuccess}
                />
            )}
        </div>
    );
}
