'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, CreditCard, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useFlutterwave } from '@/hooks/useFlutterwave';
import toast from 'react-hot-toast';

interface PayInspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    inspectionId: string;
    propertyName: string;
    inspectionFee: number;
    walletBalance: number;
    user: any;
    onSuccess: () => void;
}

export default function PayInspectionModal({ 
    isOpen, 
    onClose, 
    inspectionId,
    propertyName,
    inspectionFee,
    walletBalance,
    user,
    onSuccess
}: PayInspectionModalProps) {
    const supabase = createClient();
    const { handlePayment } = useFlutterwave();
    
    const [loadingWallet, setLoadingWallet] = useState(false);
    const [loadingCard, setLoadingCard] = useState(false);

    const TOTAL_FEE = inspectionFee + 200;

    const handleWalletPayment = async () => {
        if (walletBalance < TOTAL_FEE) {
            toast.error('Insufficient wallet balance');
            return;
        }

        setLoadingWallet(true);
        try {
            // Get agent_id or landlord_id from inspection and properties FIRST
            const { data: inspection } = await supabase
                .from('inspections')
                .select('agent_id, properties(owner_id, agent_id, landlord_id)')
                .eq('id', inspectionId)
                .single();

            let payeeId = inspection?.agent_id || 
                          inspection?.properties?.agent_id || 
                          inspection?.properties?.landlord_id || 
                          inspection?.properties?.owner_id;

            if (!payeeId) {
                toast.error('Cannot process payment: Property has no assigned landlord/agent.');
                setLoadingWallet(false);
                return;
            }

            // Deduct full amount from wallet
            const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
                payee_id_param: user.id,
                amount_param: -TOTAL_FEE
            });

            if (walletError) throw walletError;

            // Update inspection status
            const { error: updateError } = await supabase
                .from('inspections')
                .update({ status: 'Confirmed' })
                .eq('id', inspectionId);

            if (updateError) throw updateError;

            // Insert into escrow_transactions
            if (payeeId) {
                const { error: escrowError } = await supabase
                    .from('escrow_transactions')
                    .insert({
                        payer_id: user.id,
                        payee_id: payeeId,
                        amount: inspectionFee,
                        status: 'Held',
                        type: 'INSPECTION_FEE',
                        dispute_status: 'NONE',
                        reference_id: inspectionId
                    });
                if (escrowError) {
                    await supabase.from('inspections').update({ status: 'Pending' }).eq('id', inspectionId);
                    throw escrowError;
                }

                // Trigger In-App Notification for Landlord/Agent
                await supabase.from('notifications').insert({
                    user_id: payeeId,
                    title: 'Inspection Fee Paid',
                    message: `An inspection fee of ₦${TOTAL_FEE.toLocaleString()} has been paid via wallet.`,
                    type: 'success',
                    is_read: false
                });
            }

            toast.success('Inspection confirmed successfully via Wallet!');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Payment failed');
        } finally {
            setLoadingWallet(false);
        }
    };

    const handleCardPayment = async () => {
        setLoadingCard(true);
        try {
            // Validate payeeId first
            const { data: inspection } = await supabase
                .from('inspections')
                .select('agent_id, properties(owner_id, agent_id, landlord_id)')
                .eq('id', inspectionId)
                .single();

            let payeeId = inspection?.agent_id || 
                          inspection?.properties?.agent_id || 
                          inspection?.properties?.landlord_id || 
                          inspection?.properties?.owner_id;

            if (!payeeId) {
                toast.error('Cannot process payment: Property has no assigned landlord/agent.');
                setLoadingCard(false);
                return;
            }

            await handlePayment({
                amount: TOTAL_FEE,
                currency: "NGN",
                customer: {
                    email: user.email || '',
                    name: user.user_metadata?.full_name || 'Student',
                },
                meta: {
                    // @ts-ignore
                    inspection_id: inspectionId,
                    payer_id: user.id,
                    type: "inspection"
                },
                onSuccess: async (tx_ref) => {
                    try {
                        const { data: inspection } = await supabase
                            .from('inspections')
                            .select('agent_id, properties(owner_id, agent_id, landlord_id)')
                            .eq('id', inspectionId)
                            .single();
                            
                        let payeeId = inspection?.agent_id || 
                                      inspection?.properties?.agent_id || 
                                      inspection?.properties?.landlord_id || 
                                      inspection?.properties?.owner_id;

                        const { error: updateError } = await supabase
                            .from('inspections')
                            .update({ status: 'Confirmed', notes: `Paid via Card | TxRef: ${tx_ref}` })
                            .eq('id', inspectionId);

                        if (updateError) throw updateError;

                        if (payeeId) {
                            const { error: escrowError } = await supabase.from('escrow_transactions').insert({
                                payer_id: user.id,
                                payee_id: payeeId,
                                amount: inspectionFee,
                                status: 'Held',
                                type: 'INSPECTION_FEE',
                                dispute_status: 'NONE',
                                reference_id: inspectionId
                            });
                            if (escrowError) {
                                // Rollback if escrow insertion fails
                                await supabase.from('inspections').update({ status: 'Pending' }).eq('id', inspectionId);
                                throw escrowError;
                            }

                            // Trigger In-App Notification for Landlord/Agent
                            await supabase.from('notifications').insert({
                                user_id: payeeId,
                                title: 'Inspection Fee Paid',
                                message: `An inspection fee of ₦${TOTAL_FEE.toLocaleString()} has been paid and held in escrow.`,
                                type: 'success',
                                is_read: false
                            });
                        }

                        toast.success('Inspection fee paid successfully. The agent will contact you shortly.');
                        onSuccess();
                        onClose();
                    } catch (err: any) {
                        toast.error(err.message || 'Failed to update inspection status');
                    }
                },
                onClose: () => {
                    setLoadingCard(false);
                }
            });
        } catch (err: any) {
            toast.error(err.message || 'Payment initialization failed');
            setLoadingCard(false);
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

                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl pointer-events-auto border border-gray-100 dark:border-white/5"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Confirm Inspection</h3>
                                    <p className="text-sm text-gray-500 font-bold">{propertyName}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-2xl mb-6 border border-gray-100 dark:border-white/5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm text-gray-500 dark:text-gray-400">Inspection Fee</span>
                                    <span className="font-black text-gray-900 dark:text-white">₦{inspectionFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-white/10">
                                    <span className="font-bold text-sm text-gray-500 dark:text-gray-400">Service Fee</span>
                                    <span className="font-black text-gray-900 dark:text-white">₦200</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="font-bold text-gray-600 dark:text-gray-300">Total Fee</span>
                                    <span className="text-2xl font-black text-emerald-500">₦{TOTAL_FEE.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={handleWalletPayment}
                                    disabled={loadingWallet || loadingCard || walletBalance < TOTAL_FEE}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                            <Wallet size={18} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white">Pay from Wallet</div>
                                            <div className="text-xs text-gray-500 font-bold">Balance: ₦{walletBalance.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {loadingWallet ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : null}
                                </button>

                                <button 
                                    onClick={handleCardPayment}
                                    disabled={loadingWallet || loadingCard}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
                                            <CreditCard size={18} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white">Pay via Card / Bank</div>
                                            <div className="text-xs text-gray-500 font-bold">Secured by Flutterwave</div>
                                        </div>
                                    </div>
                                    {loadingCard ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : null}
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl">
                                <p className="text-xs font-bold text-orange-800 dark:text-orange-400 leading-relaxed">
                                    <strong>Note:</strong> This fee secures your inspection booking and is non-refundable once the inspection is confirmed. Please ensure you physically visit the property before authorizing any further rental payments.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
