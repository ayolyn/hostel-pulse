'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import InspectionModal from '@/components/ui/InspectionModal';
import { Heart, MessageCircle, Phone, ExternalLink, PencilLine, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useFlutterwave } from '@/hooks/useFlutterwave';
import { trackPropertyEvent } from '@/lib/analytics';

interface Props {
    propertyId: string;
    propertyName: string;
    price: number;
    priceLabel: string;
    listingType: string;
    landlordId: string;
    landlord?: {
        business_name: string;
        whatsapp_number: string;
        phone_number?: string;
        logo_url: string;
    };
    agent?: {
        full_name: string;
        phone: string;
        whatsapp_number: string;
        avatar_url: string;
        rank: string;
    };
}

export default function PropertyClientActions({ propertyId, propertyName, price, priceLabel, listingType, landlordId, landlord, agent }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    
    // Messaging states
    const [isMessaging, setIsMessaging] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [sendingMsg, setSendingMsg] = useState(false);
    const [messageSuccess, setMessageSuccess] = useState(false);
    
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const supabase = createClient();
    const { handlePayment } = useFlutterwave();

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if owner
            if (user.id === landlordId) {
                setIsOwner(true);
            }

            // Check if saved
            if (isLoggedIn) {
                const { data } = await supabase
                    .from('saved_properties')
                    .select('*')
                    .eq('property_id', propertyId)
                    .eq('student_id', user.id)
                    .single();

                if (data) {
                    setIsSaved(true);
                }
            }

            // Track view asynchronously
            trackPropertyEvent(propertyId, 'view', user?.id);
        };

        checkStatus();
    }, [isLoggedIn, propertyId, landlordId, supabase]);

    const handleProtectedAction = (callback: () => void) => {
        if (!isLoggedIn) {
            router.push('/join');
        } else {
            callback();
        }
    };

    const toggleSave = async () => {
        setSavingStatus(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            setSavingStatus(false);
            return;
        }

        if (isSaved) {
            await supabase
                .from('saved_properties')
                .delete()
                .eq('property_id', propertyId)
                .eq('student_id', user.id);
            setIsSaved(false);
        } else {
            await supabase
                .from('saved_properties')
                .insert({
                    property_id: propertyId,
                    student_id: user.id
                });
            setIsSaved(true);
        }
        setSavingStatus(false);
        router.refresh();
    };

    const sendMessage = async () => {
        try {
            if (!messageText.trim()) return;
            setSendingMsg(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSendingMsg(false);
                return;
            }

            if (!landlordId) {
                setSendingMsg(false);
                toast.error('Recipient ID missing');
                throw new Error('Recipient ID missing');
            }

            // Find or create a chat_room for this property
            let conversationId: string | null = null;
            const { data: rooms } = await supabase
                .from('chat_rooms')
                .select('id, participant_one_id, participant_two_id, property_id')
                .eq('property_id', propertyId)
                .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`);
            
            const existingRoom = rooms?.find((r: any) => 
                (r.participant_one_id === user.id && r.participant_two_id === landlordId) ||
                (r.participant_one_id === landlordId && r.participant_two_id === user.id)
            );

            if (existingRoom) {
                // If a chat already exists, we simply use it to continue the conversation
                conversationId = existingRoom.id;
            } else {
                // Create a new room
                const { data: newRoom, error: createError } = await supabase
                    .from('chat_rooms')
                    .insert({
                        participant_one_id: user.id,
                        participant_two_id: landlordId,
                        property_id: propertyId,
                        category: 'HOUSING',
                        last_message_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();
                
                if (createError) throw createError;
                conversationId = newRoom.id;
            }

            // Send the message
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: landlordId,
                    property_id: propertyId,
                    ...(conversationId ? { conversation_id: conversationId, room_id: conversationId } : {}),
                    content: messageText.trim(),
                    is_read: false
                });

            if (error) throw error;

            toast.success('Message sent! Taking you to the chat...');
            setMessageSuccess(true);
            setMessageText('');
            
            // Track lead
            trackPropertyEvent(propertyId, 'lead', user.id);
            
            // Redirect to the live chat room so the conversation can continue
            setTimeout(() => {
                router.push(`/messages/${landlordId}?room_id=${conversationId}`);
            }, 1500);

        } catch (err: any) {
            setSendingMsg(false);
            toast.error(err.message || 'An unexpected error occurred while sending the message.');
            console.error('sendMessage exception:', err);
        }
    };

    return (
        <div className="relative">
            <InspectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                propertyId={propertyId}
                propertyName={propertyName}
                agentId={landlordId} 
            />

            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter">₦{Number(price).toLocaleString()}</span>
                        <span className="text-gray-500 font-bold ml-1 text-sm uppercase">{priceLabel}</span>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
                        <span className="font-bold">Agency Fee</span>
                        <span className="font-black text-gray-900">10%</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
                        <span className="font-bold">Legal Fee</span>
                        <span className="font-black text-gray-900">5%</span>
                    </div>
                </div>

                {/* Agent Card */}
                <div className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center overflow-hidden">
                            {agent?.avatar_url || landlord?.logo_url ? (
                                <img src={agent?.avatar_url || landlord?.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-6 h-6 text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Listed By</p>
                            <h4 className="font-black text-gray-900 leading-tight">
                                {agent?.full_name || landlord?.business_name || 'Verified HostelPulse Agent'}
                            </h4>
                            {agent?.rank && (
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#BEF264]">{agent.rank} Agent</p>
                            )}
                        </div>
                        <Link href={`/agent/${landlordId}`} className="p-2 text-gray-400 hover:text-black transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => {
                                trackPropertyEvent(propertyId, 'lead');
                                const waNumber = agent?.whatsapp_number || landlord?.whatsapp_number;
                                if (waNumber) {
                                    const cleanNum = waNumber.replace(/\D/g, '');
                                    const message = encodeURIComponent(`Hi, I saw your listing for "${propertyName}" on HostelPulse. Is it still available? ${window.location.href}`);
                                    window.open(`https://wa.me/${cleanNum}?text=${message}`, '_blank');
                                } else {
                                    toast.error('WhatsApp number missing');
                                }
                            }}
                            className="bg-[#25D366] text-white flex items-center justify-center gap-2 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold text-xs shadow-lg shadow-[#25D366]/20"
                        >
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                        </button>
                        <button 
                            onClick={() => {
                                trackPropertyEvent(propertyId, 'lead');
                                const phoneNum = agent?.phone || landlord?.whatsapp_number || landlord?.phone_number;
                                if (phoneNum) {
                                    window.location.href = `tel:${phoneNum.replace(/\D/g, '')}`;
                                } else {
                                    toast.error('Contact phone number missing');
                                }
                            }}
                            className="bg-blue-600 text-white flex items-center justify-center gap-2 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold text-xs shadow-lg shadow-blue-600/20"
                        >
                            <Phone className="w-4 h-4" /> Call Agent
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 mb-3">
                    {listingType === 'rent' && (
                        <button
                            onClick={() => handleProtectedAction(() => {
                                trackPropertyEvent(propertyId, 'lead');
                                setIsModalOpen(true);
                            })}
                            className="flex-1 bg-[#BEF264] text-black font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-[#a6d456] transition-transform active:scale-95 shadow-lg shadow-[#BEF264]/20"
                        >
                            Request Inspection
                        </button>
                    )}
                    
                    <button
                        onClick={() => handleProtectedAction(toggleSave)}
                        disabled={savingStatus}
                        className={`w-14 items-center justify-center flex border-2 border-gray-100 rounded-2xl transition-all ${isSaved ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white text-gray-400 hover:border-gray-300'}`}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {isOwner && (
                    <button
                        onClick={() => router.push(`/dashboard?tab=listing-studio&edit=${propertyId}`)}
                        className="w-full border-2 border-[#BEF264] text-gray-900 font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-[#BEF264]/10 transition-transform active:scale-95 shadow-sm mb-3 flex items-center justify-center gap-2"
                    >
                        <PencilLine className="w-5 h-5" /> Edit My Listing
                    </button>
                )}

                <button
                    onClick={() => handleProtectedAction(() => {
                        trackPropertyEvent(propertyId, 'lead');
                        router.push(`/book/${propertyId}`);
                    })}
                    className="w-full bg-black text-[#BEF264] font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-neutral-800 transition-transform active:scale-95 shadow-lg shadow-gray-200 mb-3"
                >
                    Request to Book
                </button>

                {isMessaging ? (
                    <div className="mt-4 animate-in fade-in duration-300">
                        {messageSuccess ? (
                            <div className="flex flex-col items-center justify-center p-6 bg-[#BEF264]/10 rounded-2xl border border-[#BEF264]/30">
                                <div className="w-10 h-10 bg-[#BEF264] rounded-full flex items-center justify-center mb-3">
                                    <span className="text-black text-xl font-black">✓</span>
                                </div>
                                <p className="text-[#0D9488] font-black uppercase tracking-widest text-xs">Message Sent</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Hi! I'm interested in this property..."
                                    className="w-full p-4 border border-gray-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-[#BEF264] text-sm"
                                    rows={3}
                                    onFocus={() => {
                                        if (!messageText) {
                                            setMessageText(`Hi ${agent?.full_name?.split(' ')[0] || 'there'}, I'm interested in "${propertyName}" on HostelPulse. Is it available for inspection?`);
                                        }
                                    }}
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsMessaging(false)}
                                        className="flex-1 border-2 border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest py-3 rounded-xl hover:text-gray-900 hover:border-gray-300 transition-colors text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleProtectedAction(sendMessage)}
                                        disabled={sendingMsg || !messageText.trim()}
                                        className="flex-1 bg-black text-[#BEF264] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 text-xs"
                                    >
                                        {sendingMsg ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => handleProtectedAction(() => setIsMessaging(true))}
                        className="w-full border-2 border-dashed border-gray-200 text-gray-500 font-black uppercase tracking-widest py-3 rounded-2xl hover:border-gray-900 hover:text-gray-900 transition-all"
                    >
                        {agent
                            ? `Message ${agent.full_name?.split(' ')[0] || 'Agent'}`
                            : landlord
                                ? `Message ${landlord.business_name?.split(' ')[0] || 'Landlord'}`
                                : 'Message Landlord'}
                    </button>
                )}

                <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase tracking-widest">
                    Funds are held safely in escrow
                </p>
            </div>
        </div>
    );
}
