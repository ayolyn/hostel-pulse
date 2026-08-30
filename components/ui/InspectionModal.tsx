'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFlutterwave } from '@/hooks/useFlutterwave';
import toast from 'react-hot-toast';

interface InspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    propertyName: string;
    agentId?: string;
}

export default function InspectionModal({ isOpen, onClose, propertyId, propertyName, agentId }: InspectionModalProps) {
    const supabase = createClient();
    const { user, role } = useAuth();
    const { handlePayment } = useFlutterwave();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [date, setDate] = useState('');
    const [time, setTime] = useState('08:00 AM');
    const [notes, setNotes] = useState('');

    const generateTimeSlots = () => {
        const slots = [];
        for (let h = 8; h <= 18; h++) {
            for (let m = 0; m < 60; m += 15) {
                const period = h >= 12 ? 'PM' : 'AM';
                const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                const min = m === 0 ? '00' : m;
                slots.push(`${hour}:${min} ${period}`);
            }
        }
        return slots;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !role) return;

        setLoading(true);
        setError('');

        try {
            // Bypass payment for "Pay on Arrival"
            let scheduled_at: any = null;
            if (date) {
                const timeObj = new Date(date);
                if (time) {
                    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);
                    if (match) {
                        let hours = parseInt(match[1]);
                        const mins = parseInt(match[2]);
                        const isPM = match[3] === 'PM';
                        if (isPM && hours < 12) hours += 12;
                        if (!isPM && hours === 12) hours = 0;
                        timeObj.setHours(hours, mins, 0, 0);
                    } else {
                        timeObj.setHours(17, 0, 0, 0);
                    }
                }
                scheduled_at = timeObj.toISOString();

                // Prevent Duplicate Bookings
                const startOfDay = new Date(date + "T00:00:00.000Z");
                const endOfDay = new Date(date + "T23:59:59.999Z");

                const { data: existingInspections, error: checkError } = await supabase
                    .from('inspections')
                    .select('id')
                    .match({
                        property_id: propertyId,
                        requester_id: user.id
                    })
                    .in('status', ['Pending', 'Confirmed'])
                    .gte('scheduled_at', startOfDay.toISOString())
                    .lte('scheduled_at', endOfDay.toISOString());

                if (checkError) {
                    console.error('Error checking duplicate inspections:', checkError);
                    toast.error('Failed to verify booking availability. Please try again.');
                    setLoading(false);
                    return;
                }

                if (existingInspections && existingInspections.length > 0) {
                    toast.error('You already have an inspection scheduled for this property on this date.');
                    setLoading(false);
                    return;
                }
            }

            const requester_type = role === 'student' ? 'student' : 'non_student';

            let validAgentId: any = null;
            if (agentId && agentId !== 'null' && agentId !== 'undefined' && agentId.trim() !== '') {
                // Verify if the ID belongs to an agent to prevent FK constraint violations when landlords are passed
                try {
                    const { data: agentData, error: agentError } = await supabase.from('agent_accounts').select('id').eq('id', agentId).maybeSingle();
                    if (agentError) {
                        console.error('Error verifying agent:', agentError);
                        // If RLS blocked it or other error, assume it might not be a valid agent for FK
                    } else if (agentData) {
                        validAgentId = agentId;
                    }
                } catch (e) {
                    console.error('Unexpected error verifying agent:', e);
                }
            }

            const { error: insertError } = await supabase.from('inspections').insert({
                property_id: propertyId,
                requester_id: user.id,
                requester_type,
                agent_id: validAgentId,
                scheduled_at,
                notes: `${notes || ''} | Pay on Arrival`,
                status: 'Pending', 
                inspection_fee: 2000
            });

            if (insertError) {
                console.error('Inspection insert error:', insertError);
                throw new Error(insertError.message || 'Failed to submit inspection');
            }

            // Action B: Simultaneously insert automated system message and WhatsApp Notification
            if (agentId && agentId !== 'null' && agentId !== 'undefined' && agentId.trim() !== '') {
                await supabase.from('messages').insert({
                    sender_id: user.id,
                    receiver_id: agentId,
                    property_id: propertyId,
                    content: `SYSTEM: New Inspection Requested by ${user.user_metadata?.full_name || 'Student'} for ${date} at ${time}`,
                    is_read: false
                });

                // Trigger WhatsApp Notification for the Landlord
                const { data: agentData } = await supabase
                    .from('agent_accounts')
                    .select('phone, whatsapp_number')
                    .eq('id', agentId)
                    .maybeSingle();

                const { data: landlordData } = await supabase
                    .from('landlord_accounts')
                    .select('phone, whatsapp_number')
                    .eq('id', agentId)
                    .maybeSingle();

                let landlordPhone = agentData?.whatsapp_number || agentData?.phone || landlordData?.whatsapp_number || landlordData?.phone;
                
                if (landlordPhone) {
                    await supabase.from('messages_queue').insert({
                        user_id: agentId,
                        phone_number: landlordPhone.replace(/\D/g, ''),
                        message_body: `🔔 NEW LEAD! ${user.user_metadata?.full_name || 'A Student'} just requested an inspection for ${date} at ${time}. Log in to HOSTELPULSE to Accept the request and receive your ₦2,000 Escrow fee!`,
                        status: 'pending'
                    });
                }
                
                // Trigger In-App UI Notification
                await supabase.from('notifications').insert({
                    user_id: agentId,
                    title: 'New Inspection Request',
                    message: `${user.user_metadata?.full_name || 'A Student'} just requested an inspection for ${date} at ${time}.`,
                    type: 'info',
                    is_read: false
                });
            }

            setSuccess(true);
            toast.success('Inspection requested successfully!');
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 3000);
            setLoading(false);
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit inspection');
            setError(err.message || 'Failed to submit inspection');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full md:w-[500px] bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto pointer-events-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Request Inspection</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">for {propertyName}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors pointer-events-auto"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                        {success ? (
                            <div className="py-10 text-center space-y-4">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">Request Sent!</h4>
                                    <p className="text-gray-500 mt-1">An agent will contact you shortly to confirm the exact time.</p>
                                </div>
                            </div>
                        ) : (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.user_metadata?.full_name || ''}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-gray-400">Name is synced from your Google profile.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Preferred Date *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Time Slot</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <select
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all bg-white"
                                            >
                                                {generateTimeSlots().map((slot) => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Message (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any specific value? e.g. I need to move in by next week."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#BEF264] transition-all resize-none"
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#BEF264] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-[#a6d456] transition-colors shadow-lg shadow-[#BEF264]/20 mt-4 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                                </button>
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                                    Inspection Fee: ₦2,000 (Pay on arrival)
                                </p>
                            </form>
                        )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
