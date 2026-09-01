"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { createNotification } from '@/lib/notifications';
import { 
    Calendar, 
    MapPin, 
    MessageCircle, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Phone, 
    ExternalLink,
    ChevronRight,
    User,
    Building2,
    ShieldCheck, 
    AlertCircle,
    QrCode,
    X
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface Inspection {
    id: string;
    requester_id: string;
    scheduled_at: string;
    status: string;
    inspection_fee: number;
    properties: {
        id: string;
        title: string;
        images: string[];
    } | null;
    requester: {
        full_name: string;
        level: string;
        department: string;
        phone: string;
        whatsapp_number: string;
    } | null;
    dispute_status?: string;
    escrow_status?: string;
}

export default function InspectionsTab({ userId }: { userId: string }) {
    const supabase = createClient();
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [moveIns, setMoveIns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [selectedInspectionDetails, setSelectedInspectionDetails] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchInspections() {
            setLoading(true);
            try {
                // 1. First get all property IDs owned by this landlord
                const { data: propsData } = await supabase
                    .from('properties')
                    .select('id, title, images')
                    .or(`owner_id.eq.${userId},landlord_id.eq.${userId}`);
                
                const properties = propsData || [];
                const propertyIds = properties.map(p => p.id);

                let safeInspData: any[] = [];
                if (propertyIds.length > 0) {
                    // 2. Clean standard fetch for inspections using property_id (agent_id is null for landlords)
                    const { data: rawInspections, error: inspError } = await supabase
                        .from('inspections')
                        .select('*')
                        .in('property_id', propertyIds)
                        .order('scheduled_at', { ascending: true });

                    if (inspError) console.error("Inspections Fetch Error:", inspError);
                    safeInspData = rawInspections || [];
                }

                // 3. Fetch Escrow Transactions separately
                const { data: escrowData, error: escrowError } = await supabase
                    .from('escrow_transactions')
                    .select('*')
                    .eq('payee_id', userId);

                if (escrowError) console.error("Escrow fetch error:", escrowError);
                const safeEscrowData = escrowData || [];

                // 4. Fetch related Requesters (Profiles & Student Accounts)
                const requesterIds = Array.from(new Set(safeInspData.map((i: any) => i.requester_id).filter(Boolean)));
                let profiles: any[] = [];
                let studentAccounts: any[] = [];
                if (requesterIds.length > 0) {
                    const { data: profData } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', requesterIds);
                    profiles = profData || [];

                    const { data: studData } = await supabase
                        .from('student_accounts')
                        .select('id, level, department, phone, whatsapp_number')
                        .in('id', requesterIds);
                    studentAccounts = studData || [];
                }

                // 5. Fetch related Escrow Payers (just in case they differ from requesters, though usually the same)
                const payerIds = Array.from(new Set(safeEscrowData.map((e: any) => e.payer_id).filter(Boolean)));
                let escrowStudents: any[] = [];
                if (payerIds.length > 0) {
                    const { data: payerData } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', payerIds);
                    escrowStudents = payerData || [];
                }

                // Map everything together in JavaScript
                const formattedInsp = safeInspData.map((i: any) => {
                    const property = properties.find((p: any) => p.id === i.property_id);
                    const profile = profiles.find((p: any) => p.id === i.requester_id);
                    const student = studentAccounts.find((s: any) => s.id === i.requester_id);
                    const tx = safeEscrowData.find((e: any) => e.reference_id === i.id);

                    return {
                        ...i,
                        escrow_status: tx?.status || 'UNPAID',
                        dispute_status: tx?.dispute_status,
                        properties: property || null,
                        requester: profile ? {
                            ...profile,
                            level: student?.level || '',
                            department: student?.department || '',
                            phone: student?.phone || '',
                            whatsapp_number: student?.whatsapp_number || student?.phone || ''
                        } : null
                    };
                });

                const formattedEscrow = safeEscrowData.map((e: any) => {
                    const property = properties.find((p: any) => p.id === e.property_id);
                    const student = escrowStudents.find((s: any) => s.id === e.payer_id);
                    return {
                        ...e,
                        properties: property || null,
                        student: student || null
                    };
                });

                setInspections(formattedInsp);
                setMoveIns(formattedEscrow.filter((e: any) => e.type !== 'INSPECTION_FEE' && e.status === 'Held'));
            } catch (err) {
                console.error("Unexpected error fetching dashboard data:", err);
                toast.error("Failed to load dashboard data. Check connection.");
            } finally {
                setLoading(false);
            }
        }
        fetchInspections();
    }, [userId, supabase]);

    const handleAction = async (id: string, newStatus: string) => {
        const item = inspections.find(i => i.id === id);
        
        // Handle Refunds for Paid (Confirmed) cancellations
        if (newStatus === 'Cancelled' && item?.status === 'Confirmed') {
            const { error: refundError } = await supabase.rpc('increment_wallet_balance', {
                payee_id_param: item.requester_id,
                amount_param: 2000
            });
            if (refundError) {
                toast.error('Failed to process refund. Cancellation aborted.');
                return;
            }
        }

        const { updateInspectionStatusAction } = await import('@/app/actions/inspection');
        const { error } = await updateInspectionStatusAction(id, newStatus, userId);

        if (!error) {
            setInspections(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
            
            // If completed, increment agent's tours
            if (newStatus === 'Completed') {
                await supabase.rpc('increment_agent_tours', { agent_uid: userId });
            }

            if (newStatus === 'Cancelled') {
                if (item?.requester_id) {
                    await createNotification(
                        item.requester_id,
                        'Inspection Cancelled',
                        'Your inspection request was cancelled by the agent.',
                        '/dashboard/student',
                        'inspection_cancelled'
                    );
                }
                if (item?.status === 'Confirmed') {
                    toast.success('Inspection Cancelled & ₦2,000 Refunded to Student.');
                } else {
                    toast.success('Inspection Cancelled.');
                }
            }
        } else {
            toast.error('Failed to update inspection status.');
        }
    };

    const openWhatsApp = (inspection: Inspection) => {
        if (!inspection.requester) return;
        const msg = encodeURIComponent(`Hello ${inspection.requester.full_name}, I am the agent for ${inspection.properties?.title}. I have accepted your inspection request for ${new Date(inspection.scheduled_at).toLocaleString()}!`);
        const phone = inspection.requester.whatsapp_number || inspection.requester.phone;
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5" />
                ))}
            </div>
        );
    }

    if (inspections.length === 0 && moveIns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-10 border border-gray-100 dark:border-white/5">
                    <Calendar className="w-16 h-16 text-gray-200 dark:text-white/5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Queue is Clear</h2>
                <p className="text-gray-500 max-w-sm mx-auto font-black uppercase tracking-widest text-[10px]">
                    No leads or move-ins currently pending. New requests from Under-G will appear here!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#BEF264]" />
                Verification Queue
            </h2>

            <div className="grid grid-cols-1 gap-6">
                {inspections.map((item) => {
                    // ... existing inspection rendering logic ...
                    const isPending = item.status === 'Pending';
                    const isScheduled = item.status === 'Scheduled';
                    const isConfirmed = item.status === 'Confirmed';
                    const isCompleted = item.status === 'Completed';
                    const propertyImg = item.properties?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=200';

                    return (
                        <div key={item.id} className={`bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm rounded-3xl p-5 flex flex-col md:flex-row gap-5 transition-all hover:border-[#BEF264]/30 hover:shadow-md ${isCompleted ? 'opacity-60' : ''}`}>
                            {/* Student Identity */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#BEF264]/10 rounded-2xl flex items-center justify-center text-[#BEF264] border border-[#BEF264]/20 shadow-xl">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.requester?.full_name || 'Anonymous Student'}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mt-1">
                                            {item.requester?.level || '—'} {item.requester?.department || '—'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        <Clock className="w-4 h-4 text-[#BEF264]" />
                                        {new Date(item.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#BEF264]/10 border border-[#BEF264]/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-[#BEF264]">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        ₦{Number(item.inspection_fee).toLocaleString()} Escrow Secured
                                    </div>
                                    {item.dispute_status === 'OPEN' && (
                                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-red-500">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            FROZEN / DISPUTED
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Property Link */}
                            <div className="flex-1 flex gap-4 bg-gray-50 dark:bg-black/40 rounded-3xl p-4 border border-gray-100 dark:border-white/5">
                                <img src={propertyImg} alt="" className="w-20 h-20 rounded-2xl object-cover grayscale-[0.5]" />
                                <div className="flex flex-col justify-center">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400 mb-1">Target Property</h4>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{item.properties?.title || 'Unknown Hostel'}</p>
                                    <button onClick={() => setSelectedInspectionDetails(item)} className="text-[9px] font-black uppercase tracking-widest text-[#BEF264] mt-2 underline text-left">View Details</button>
                                </div>
                            </div>

                            {/* Workflow Actions */}
                            <div className="flex flex-col justify-center gap-3 w-full md:w-64">
                                {isPending && (
                                    <>
                                        <button 
                                            onClick={() => handleAction(item.id, 'Confirmed')}
                                            className="w-full bg-[#BEF264] text-black font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-[#BEF264]/10 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            Accept Request
                                        </button>
                                        <button 
                                            onClick={() => handleAction(item.id, 'Cancelled')}
                                            className="w-full bg-red-50 dark:bg-white/5 text-red-500 font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-red-100 dark:hover:bg-red-500/10 transition-all"
                                        >
                                            Cancel Request
                                        </button>
                                    </>
                                )}

                                {isConfirmed && (
                                    <>
                                        <button 
                                            onClick={() => router.push(`?tab=messages&userId=${item.requester_id}`)}
                                            className="w-full bg-emerald-600 text-white font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/10"
                                        >
                                            <MessageCircle className="w-4 h-4" /> Message Student
                                        </button>
                                        {item.escrow_status?.toUpperCase() === 'HELD' || item.escrow_status?.toUpperCase() === 'PENDING' ? (
                                            <button 
                                                onClick={() => handleAction(item.id, 'Completed')}
                                                className="w-full bg-gray-100 dark:bg-white/5 text-emerald-600 dark:text-[#BEF264] font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-gray-200 dark:hover:bg-[#BEF264]/10 transition-all"
                                            >
                                                Mark as Completed
                                            </button>
                                        ) : (
                                            <button 
                                                disabled
                                                className="w-full bg-gray-100 dark:bg-white/5 text-gray-400 font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] opacity-50 cursor-not-allowed"
                                            >
                                                Awaiting Payment
                                            </button>
                                        )}
                                        <button 
                                            onClick={async () => {
                                                if (item.dispute_status !== 'OPEN') {
                                                    const reason = prompt("Please provide a reason for the dispute:");
                                                    if (reason) {
                                                        const tx = moveIns.find((e: any) => e.reference_id === item.id) || await supabase.from('escrow_transactions').select('id').eq('reference_id', item.id).single().then(r => r.data);
                                                        if (tx?.id) {
                                                            const { initiateEscrowDispute } = await import('@/app/actions/escrow');
                                                            const res = await initiateEscrowDispute(tx.id, reason);
                                                            if (res.error) alert(res.error);
                                                            else { alert("Issue reported successfully!"); window.location.reload(); }
                                                        } else {
                                                            alert("Transaction not found for this inspection.");
                                                        }
                                                    }
                                                }
                                            }}
                                            className="w-full bg-red-50 dark:bg-white/5 text-red-500 font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-red-100 dark:hover:bg-red-500/10 transition-all mt-2"
                                        >
                                            Report Issue
                                        </button>
                                    </>
                                )}

                                {isCompleted && (
                                    <div className="text-center font-black uppercase tracking-widest text-[10px] text-emerald-500 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Finished Tour
                                    </div>
                                )}
                                
                                {item.status === 'Cancelled' && (
                                    <div className="text-center font-black uppercase tracking-widest text-[10px] text-red-500 flex items-center justify-center gap-2">
                                        <XCircle className="w-4 h-4" /> Request Declined
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Inspection Details Modal */}
            {selectedInspectionDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/10 p-6 relative shadow-2xl space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">Inspection Details</h3>
                            <button onClick={() => setSelectedInspectionDetails(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4 text-sm font-medium">
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1">Property</div>
                                <div className="font-bold text-gray-900 dark:text-white">{selectedInspectionDetails.properties?.title || 'Unknown Property'}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1">Schedule</div>
                                <div className="font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Clock className="w-4 h-4 text-gray-400"/> {selectedInspectionDetails.scheduled_at ? new Date(selectedInspectionDetails.scheduled_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1">Status & Fee</div>
                                <div className="font-bold flex items-center justify-between text-gray-900 dark:text-white">
                                    <span>₦2,000</span>
                                    <span className="px-2 py-1 bg-gray-200 dark:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
                                        {selectedInspectionDetails.status}
                                    </span>
                                </div>
                                {selectedInspectionDetails.dispute_status === 'OPEN' && (
                                    <div className="mt-2 text-red-500 text-xs font-bold uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded-lg inline-block">Frozen / Disputed</div>
                                )}
                            </div>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button 
                                onClick={() => {
                                    router.push(`?tab=messages&userId=${selectedInspectionDetails.requester_id}`);
                                    setSelectedInspectionDetails(null);
                                }}
                                className="flex-1 bg-emerald-600 text-white font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/10"
                            >
                                Message Student
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Move-in Handshake Section */}
            {moveIns.length > 0 && (
                <div className="pt-12 space-y-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-[#BEF264]" />
                        Move-in Handshake
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {moveIns.map((tx) => (
                            <div key={tx.id} className="bg-white dark:bg-white/5 border border-emerald-200 dark:border-[#BEF264]/20 rounded-3xl p-5 flex flex-col md:flex-row gap-5 items-center bg-gradient-to-br from-emerald-50 dark:from-white/5 to-emerald-100/50 dark:to-[#BEF264]/5 shadow-sm">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-[#BEF264]" />
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Secure Rent Secured</h3>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        Student: <span className="text-emerald-900 dark:text-white">{tx.student?.full_name || 'Anonymous'}</span> • {tx.properties?.title}
                                    </p>
                                    <div className="pt-4">
                                        <span className="text-2xl font-black text-[#BEF264]">₦{Number(tx.amount).toLocaleString()}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-gray-600 ml-2">Held in Escrow</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedTx(tx)}
                                    className="px-10 py-3 bg-[#BEF264] text-black font-black rounded-2xl uppercase tracking-widest text-xs shadow-2xl shadow-[#BEF264]/20 flex items-center gap-3 hover:scale-105 transition-all"
                                >
                                    <QrCode className="w-5 h-5" />
                                    Generate Move-in QR
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/10 p-6 text-center relative shadow-2xl">
                        <button 
                            onClick={() => setSelectedTx(null)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-[#BEF264]/10 px-4 py-1.5 rounded-full border border-[#BEF264]/20">
                                <ShieldCheck className="w-4 h-4 text-[#BEF264]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#BEF264]">Secure Settlement QR</span>
                            </div>
                            
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Confirm Move-in</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 leading-relaxed">
                                Let the student scan this code after they have verified the room and moved in.
                            </p>
                            
                            <div className="bg-white p-6 rounded-3xl mx-auto w-fit shadow-2xl border-8 border-gray-50 dark:border-white/5">
                                <QRCodeCanvas 
                                    value={selectedTx.id} 
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{selectedTx.properties?.title}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-[#BEF264] mt-1">Valued at ₦{Number(selectedTx.amount).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Minimal Link replacement if not used
const Link = ({ children, href, className }: any) => <a href={href} className={className}>{children}</a>;
