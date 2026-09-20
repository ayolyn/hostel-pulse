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
    otherFeeDescription?: string;
    totalMoveInCost: number;
    listingType: string;
    landlordId: string;
    isVerified: boolean;
    landlord?: {
        business_name: string;
        whatsapp_number: string;
        phone_number?: string;
        logo_url: string;
    };
    agent?: {
        id?: string;
        full_name: string;
        phone: string;
        whatsapp_number: string;
        avatar_url: string;
        rank: string;
    };
}

export default function PropertyClientActions({ 
    propertyId, propertyName, isActive, annualRent, agentFee, agreementFee, 
    cautionFee, inspectionFee, serviceCharge, otherFees, otherFeeDescription, totalMoveInCost, 
    listingType, landlordId, landlord, agent, isVerified 
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    
    const router = useRouter();
    const { isLoggedIn, role } = useAuth();
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
            if (navigator.share) {
                await navigator.share({
                    title: propertyName,
                    text: 'Check out this property on HostelPulse',
                    url: window.location.href,
                });
            } else {
                setIsShareModalOpen(true);
            }
        } catch (err) {
            setIsShareModalOpen(true);
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
            
            {/* Call Agent Modal */}
            {isCallModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-4">Call Agent</h3>
                        <p className="text-sm text-gray-500 mb-6">You are about to contact {agent?.full_name || landlord?.business_name || 'the agent'}. Mention HostelPulse for faster service.</p>
                        
                        <div className="space-y-3">
                            <a href={`tel:${(agent?.phone || landlord?.whatsapp_number || landlord?.phone_number)?.replace(/\D/g, '')}`} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
                                <Phone className="w-5 h-5" /> {(agent?.phone || landlord?.whatsapp_number || landlord?.phone_number)}
                            </a>
                        </div>
                        <button onClick={() => setIsCallModalOpen(false)} className="w-full mt-4 py-3 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-900 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-4">Share Property</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                            <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${propertyName} on HostelPulse: ${window.location.href}`)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <MessageCircle className="w-6 h-6 text-[#25D366]" />
                                <span className="text-xs font-bold text-gray-900">WhatsApp</span>
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-xs font-bold text-blue-600">f</span>
                                <span className="text-xs font-bold text-gray-900">Facebook</span>
                            </a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${propertyName} on HostelPulse!`)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-xs font-black text-black">X</span>
                                <span className="text-xs font-bold text-gray-900">X (Twitter)</span>
                            </a>
                            <a href={`mailto:?subject=${encodeURIComponent(`Check out ${propertyName}`)}&body=${encodeURIComponent(`I thought you might like this property on HostelPulse: ${window.location.href}`)}`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-xs font-black text-gray-600">✉</span>
                                <span className="text-xs font-bold text-gray-900">Email</span>
                            </a>
                            <a href={`sms:?body=${encodeURIComponent(`Check out ${propertyName} on HostelPulse: ${window.location.href}`)}`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-xs font-black text-gray-600">💬</span>
                                <span className="text-xs font-bold text-gray-900">SMS</span>
                            </a>
                            <button onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copied!');
                                setIsShareModalOpen(false);
                            }} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <Share2 className="w-6 h-6 text-gray-600" />
                                <span className="text-xs font-bold text-gray-900">Copy Link</span>
                            </button>
                        </div>
                        <button onClick={() => setIsShareModalOpen(false)} className="w-full py-3 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-900 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-left">
                        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">Report Listing</h3>
                        <p className="text-xs text-gray-500 mb-6 font-medium">Help us keep HostelPulse safe. What's wrong with this property?</p>
                        
                        <div className="space-y-3 mb-6">
                            {['Property doesn\'t exist', 'Problem with fee', 'Misleading listing', 'No longer available', 'Something else'].map((reason) => (
                                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${reportReason === reason ? 'border-red-500 bg-red-500' : 'border-gray-300 group-hover:border-red-300'}`}>
                                        {reportReason === reason && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <input type="radio" className="hidden" name="report" value={reason} onChange={() => setReportReason(reason)} />
                                    <span className="text-sm font-bold text-gray-700">{reason}</span>
                                </label>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => {
                                if (!reportReason) {
                                    toast.error('Please select a reason');
                                    return;
                                }
                                toast.success('Report submitted successfully. We will look into it.');
                                setIsReportModalOpen(false);
                            }}
                            className="w-full bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity text-xs"
                        >
                            Submit Report
                        </button>
                        <button onClick={() => setIsReportModalOpen(false)} className="w-full mt-4 py-3 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-900 transition-colors text-center">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="sticky top-24 bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
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
                                <span className="text-gray-600 font-medium">Other Fees {otherFeeDescription && `(${otherFeeDescription})`}</span>
                                <span className="font-bold text-gray-900">₦{Number(otherFees).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between">
                        <span className="font-black text-[10px] uppercase tracking-widest text-gray-500">Total Move-in Cost</span>
                        <span className="text-xl font-black text-[#BEF264] drop-shadow-sm bg-black px-3 py-1 rounded-lg">₦{Number(totalMoveInCost || annualRent).toLocaleString()}</span>
                    </div>
                </div>

                {/* Primary CTA */}
                {isVerified && (
                    <div className="mb-6">
                        <button
                            onClick={() => handleProtectedAction(() => {
                                toast.success('Redirecting to secure payment...', { icon: '🔒' });
                                const dashboardPath = role === 'non_student' ? '/dashboard/non-student' : 
                                                      role ? `/dashboard/${role.toLowerCase()}` : 
                                                      '/dashboard/student';
                                router.push(`${dashboardPath}?tab=wallet`);
                            })}
                            disabled={!isActive}
                            className={`w-full font-black uppercase tracking-[0.1em] py-5 rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 border-2 ${isActive ? 'bg-[#BEF264] text-black hover:bg-[#a5d953] active:scale-[0.98] border-transparent hover:border-black/5 shadow-[#BEF264]/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed border-transparent'}`}
                        >
                            {listingType === 'buy' ? 'Proceed to Payment (Escrow)' : 'Rent Now (Secure Escrow)'}
                        </button>
                    </div>
                )}

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

                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => {
                                handleProtectedAction(() => {
                                    trackPropertyEvent(propertyId, 'lead');
                                    const dashboardPath = role === 'non_student' ? '/dashboard/non-student' : 
                                                          role ? `/dashboard/${role.toLowerCase()}` : 
                                                          '/dashboard/student';
                                    router.push(`${dashboardPath}?tab=messages&contact=${agent?.id || landlordId}`);
                                });
                            }}
                            className="bg-blue-600 text-white flex items-center justify-center gap-2 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold text-xs shadow-sm"
                        >
                            <MessageCircle className="w-4 h-4" /> Chat Agent
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
                        onClick={() => setIsShareModalOpen(true)}
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
                
                <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full text-gray-400 font-bold uppercase tracking-widest py-3 hover:text-red-500 transition-colors flex items-center justify-center gap-2 text-[10px]"
                >
                    <AlertCircle className="w-4 h-4" /> Report this listing
                </button>
            </div>
        </div>
    );
}
