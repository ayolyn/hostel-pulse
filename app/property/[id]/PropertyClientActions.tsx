'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import InspectionModal from '@/components/ui/InspectionModal';
import { Heart, MessageCircle, Phone, ExternalLink, PencilLine, Building2, Share2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { trackPropertyEvent } from '@/lib/analytics';

interface Props {
    propertyId: string;
    propertyName: string;
    isActive: boolean;
    annualRent: number;
    agentFee: number;
    agreementFee: number;
    cautionFee: number;
    inspectionFee: number;
    serviceCharge: number;
    otherFees: number;
    totalMoveInCost: number;
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

export default function PropertyClientActions({ 
    propertyId, propertyName, isActive, annualRent, agentFee, agreementFee, 
    cautionFee, inspectionFee, serviceCharge, otherFees, totalMoveInCost, 
    listingType, landlordId, landlord, agent 
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const supabase = createClient();

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (user.id === landlordId) {
                setIsOwner(true);
            }

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
            await supabase.from('saved_properties').delete().eq('property_id', propertyId).eq('student_id', user.id);
            setIsSaved(false);
        } else {
            await supabase.from('saved_properties').insert({ property_id: propertyId, student_id: user.id });
            setIsSaved(true);
        }
        setSavingStatus(false);
        router.refresh();
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: propertyName,
                text: 'Check out this property on HostelPulse',
                url: window.location.href,
            });
        } catch (err) {
            console.log('Error sharing', err);
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
                {!isActive && (
                    <div className="mb-4 bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-red-800 font-bold text-sm uppercase tracking-widest">Unavailable</h4>
                            <p className="text-red-600 text-xs mt-1">This property is currently taken or unavailable.</p>
                        </div>
                    </div>
                )}
                
                {/* Price Breakdown */}
                <div className="mb-6">
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 border-b border-gray-100 pb-2">Fee Breakdown</h3>
                    
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Annual Rent</span>
                            <span className="font-bold text-gray-900">₦{Number(annualRent || 0).toLocaleString()}</span>
                        </div>
                        {!(Number(agentFee) > 0 || Number(agreementFee) > 0 || Number(cautionFee) > 0 || Number(inspectionFee) > 0 || Number(serviceCharge) > 0 || Number(otherFees) > 0) && (
                            <div className="text-sm text-gray-500 italic mt-2">
                                No additional mandatory fees listed.
                            </div>
                        )}
                        {Number(agentFee) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Agent Fee</span>
                                <span className="font-bold text-gray-900">₦{Number(agentFee).toLocaleString()}</span>
                            </div>
                        )}
                        {Number(agreementFee) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Agreement / Legal</span>
                                <span className="font-bold text-gray-900">₦{Number(agreementFee).toLocaleString()}</span>
                            </div>
                        )}
                        {Number(cautionFee) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Caution Fee</span>
                                <span className="font-bold text-gray-900">₦{Number(cautionFee).toLocaleString()}</span>
                            </div>
                        )}
                        {Number(inspectionFee) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Inspection Fee</span>
                                <span className="font-bold text-gray-900">₦{Number(inspectionFee).toLocaleString()}</span>
                            </div>
                        )}
                        {Number(serviceCharge) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Service Charge</span>
                                <span className="font-bold text-gray-900">₦{Number(serviceCharge).toLocaleString()}</span>
                            </div>
                        )}
                        {Number(otherFees) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Other Fees</span>
                                <span className="font-bold text-gray-900">₦{Number(otherFees).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between">
                        <span className="font-black text-[10px] uppercase tracking-widest text-gray-500">Total Move-in Cost</span>
                        <span className="text-xl font-black text-[#BEF264] drop-shadow-sm bg-black px-3 py-1 rounded-lg">₦{Number(totalMoveInCost || annualRent).toLocaleString()}</span>
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
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Managed By</p>
                            <h4 className="font-black text-gray-900 leading-tight">
                                {agent?.full_name || landlord?.business_name || 'HostelPulse Agent'}
                            </h4>
                            {agent?.rank && (
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#BEF264]">{agent.rank === 'Broker' ? 'Agent' : agent.rank || 'Agent'}</p>
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
                                    const cleanNum = waNumber?.replace(/\D/g, '').replace(/^0/, '234');
                                    const message = encodeURIComponent(`Hi, I saw your listing for "${propertyName}" on HostelPulse. Is it still available? ${window.location.href}`);
                                    window.open(`https://wa.me/${cleanNum}?text=${message}`, '_blank');
                                } else {
                                    toast.error('WhatsApp number missing');
                                }
                            }}
                            className="bg-[#25D366] text-white flex items-center justify-center gap-2 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold text-xs shadow-sm"
                        >
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                        </button>
                        <button 
                            onClick={() => {
                                trackPropertyEvent(propertyId, 'lead');
                                const phoneNum = agent?.phone || landlord?.whatsapp_number || landlord?.phone_number;
                                if (phoneNum) {
                                    window.location.href = `tel:${phoneNum?.replace(/\D/g, '')}`;
                                } else {
                                    toast.error('Contact phone number missing');
                                }
                            }}
                            className="bg-blue-600 text-white flex items-center justify-center gap-2 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold text-xs shadow-sm"
                        >
                            <Phone className="w-4 h-4" /> Call Agent
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 mb-3">
                    <button
                        onClick={() => handleProtectedAction(() => {
                            trackPropertyEvent(propertyId, 'lead');
                            setIsModalOpen(true);
                        })}
                        disabled={!isActive}
                        className={`flex-1 font-black uppercase tracking-widest py-3 rounded-2xl transition-transform active:scale-95 shadow-sm text-xs ${isActive ? 'bg-black text-[#BEF264] hover:bg-neutral-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        Request Inspection
                    </button>
                    
                    <button
                        onClick={() => handleProtectedAction(toggleSave)}
                        disabled={savingStatus}
                        className={`w-14 items-center justify-center flex border-2 border-gray-100 rounded-2xl transition-all ${isSaved ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white text-gray-400 hover:border-gray-300'}`}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="w-14 items-center justify-center flex border-2 border-gray-100 rounded-2xl transition-all bg-white text-gray-400 hover:border-gray-300 hover:text-gray-900"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {isOwner && (
                    <button
                        onClick={() => router.push(`/dashboard/landlord?tab=listings&edit=${propertyId}`)}
                        className="w-full border-2 border-gray-200 text-gray-900 font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm mb-3 flex items-center justify-center gap-2 text-xs"
                    >
                        <PencilLine className="w-5 h-5" /> Edit My Listing
                    </button>
                )}
            </div>
        </div>
    );
}
