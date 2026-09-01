export const runtime = 'edge';
import { createClient } from '@/lib/supabase/server';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { ShieldCheck, Lock, QrCode, Building2, MapPin, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function EscrowTrackerPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    // Fetch transaction
    const { data: trx, error } = await supabase
        .from('escrow_transactions')
        .select(`
            *,
            property:properties(title, location, images),
            landlord:landlord_accounts(full_name),
            agent:agent_accounts(full_name)
        `)
        .eq('id', params.id)
        .single();

    if (error || !trx) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <Lock className="w-16 h-16 text-gray-200 mb-6" />
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Transaction Not Found</h1>
                <p className="text-gray-500 mb-8 max-w-sm">This escrow transaction does not exist or you don't have permission to view it.</p>
                <Link href="/dashboard/student" className="bg-black text-[#BEF264] px-4 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all shadow-lg">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const totalAmount = Number(trx.amount) + Number(trx.agency_fee) + Number(trx.legal_fee);

    const steps = [
        { id: 1, title: 'Offer Accepted', desc: 'Landlord approved application', date: new Date(trx.created_at).toLocaleDateString(), completed: true },
        { id: 2, title: 'Funds Locked', desc: `₦${totalAmount.toLocaleString()} secured in escrow`, date: new Date(trx.created_at).toLocaleDateString(), completed: true },
        { id: 3, title: 'Move-in & Verify', desc: 'Scan QR at the property', date: 'Pending', completed: trx.status === 'Released' },
        { id: 4, title: 'Funds Released', desc: 'Landlord gets paid', date: trx.released_at ? new Date(trx.released_at).toLocaleDateString() : 'Pending', completed: trx.status === 'Released' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            <PublicHeader />

            <main className="pt-32 px-6 max-w-4xl mx-auto space-y-8">

                {/* Header Status */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold uppercase tracking-widest text-xs rounded-full mb-4">
                            <ShieldCheck className="w-4 h-4" /> HostelPulse Secure Escrow
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter">
                            Transaction Tracker
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">ID: {trx.id.split('-')[0].toUpperCase()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left Col - Tracker & QR */}
                    <div className="space-y-8">
                        {/* Status Card */}
                        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-200/50">
                            {trx.status === 'Locked' ? (
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Funds Secured</h2>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Your rent is safely locked in the vault.</p>
                                </div>
                            ) : trx.status === 'Released' ? (
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-black text-emerald-600 uppercase tracking-tight">Payment Released</h2>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Transaction completed successfully.</p>
                                </div>
                            ) : (
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-black text-red-600 uppercase tracking-tight">Disputed</h2>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Resolution in progress.</p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="relative pl-4 space-y-6">
                                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100 -z-10" />
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 relative z-10">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${step.completed ? 'bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/30' : 'bg-white border-2 border-gray-200'}`}>
                                            {step.completed && <CheckCircle2 className="w-3 h-3" />}
                                        </div>
                                        <div>
                                            <h4 className={`font-black uppercase tracking-tight text-sm ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{step.desc}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{step.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Release QR Code Box */}
                        {trx.status === 'Locked' && trx.qr_release_code && (
                            <div className="bg-gray-900 text-white rounded-[2rem] p-5 text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
                                <div className="relative z-10">
                                    <QrCode className="w-12 h-12 text-[#BEF264] mx-auto mb-4" />
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">Move-in Key</h3>
                                    <p className="text-gray-400 text-sm mb-6 max-w-[200px] mx-auto">
                                        Show this code to the landlord/agent on move-in day to release funds.
                                    </p>
                                    <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl inline-block mt-4 select-all cursor-pointer">
                                        <p className="text-2xl tracking-[0.5em] font-mono font-black">{trx.qr_release_code}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3">Do not share before arrival</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Col - Transaction Details */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4">Transaction Details</h3>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <Link href={`/property/${trx.property_id}`} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl group hover:border-gray-200 border border-transparent transition-all">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                    <Building2 className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">{trx.property?.title}</h4>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                        <MapPin className="w-3 h-3" /> {trx.property?.location}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </Link>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Rent Amount</span>
                                    <span className="font-black text-gray-900">₦{Number(trx.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Agency Fee</span>
                                    <span className="font-black text-gray-900">₦{Number(trx.agency_fee).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Legal Fee</span>
                                    <span className="font-black text-gray-900">₦{Number(trx.legal_fee).toLocaleString()}</span>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-900 font-black uppercase tracking-tight">Total Locked</span>
                                    <span className="text-2xl font-black text-indigo-600">₦{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Parties Involved</h4>
                            <div className="flex justify-between items-center text-sm pb-2 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Landlord</span>
                                <span className="font-bold text-gray-900">{trx.landlord?.full_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Agent</span>
                                <span className="font-bold text-gray-900">{trx.agent?.full_name || 'HostelPulse Direct'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
