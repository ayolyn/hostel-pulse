"use client";
export const runtime = 'edge';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NonStudentDashboardShell } from '@/components/layout/NonStudentDashboardShell';
import { 
    Home, ShoppingBag, Heart, FileSearch, Calendar, MapPin, Clock, 
    CheckCircle2, AlertCircle, Search, ArrowRight, MessageSquare,
    TrendingUp, ShieldCheck, Wallet, DollarSign, Activity
} from 'lucide-react';
import Link from 'next/link';
import MessagingTab from '@/components/dashboard/MessagingTab';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { SupportHub } from '@/components/messages/SupportHub';
import BuyerWalletTab from '@/components/dashboard/BuyerWalletTab';
import PayInspectionModal from '@/components/dashboard/PayInspectionModal';

// ===================== DASHBOARD TAB =====================
function DashboardOverview() {
    const supabase = createClient();
    const [fullName, setFullName] = useState('');
    const [inspections, setInspections] = useState<any[]>([]);
    const [escrowStats, setEscrowStats] = useState({ total: 0, held: 0, released: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setFullName(user.user_metadata?.full_name?.split(' ')[0] ?? 'User');

            const [{ data: insp }, { data: escrow }] = await Promise.all([
                supabase.from('inspections')
                    .select('id, scheduled_at, status, properties(title, location)')
                    .eq('requester_id', user.id)
                    .order('scheduled_at', { ascending: false })
                    .limit(4),
                supabase.from('escrow_transactions')
                    .select('id, amount, status')
                    .eq('payer_id', user.id)
            ]);

            setInspections(insp ?? []);
            
            const held = escrow?.filter((e: any) => e.status === 'Held') || [];
            const released = escrow?.filter((e: any) => e.status === 'Released') || [];
            setEscrowStats({
                total: escrow?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0,
                held: held.reduce((sum: number, e: any) => sum + Number(e.amount), 0),
                released: released.reduce((sum: number, e: any) => sum + Number(e.amount), 0),
            });
            setLoading(false);
        }
        loadData();
    }, []);

    const statusStyle: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
        Confirmed: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 },
        Pending: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Clock },
        Completed: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: CheckCircle2 },
        Cancelled: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10', icon: AlertCircle },
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-neutral-900 animate-pulse h-32 rounded-3xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Welcome{fullName ? `, ${fullName}` : ''}
                    </h1>
                    <p className="text-gray-500 font-medium">Discover, inspect and acquire properties in Ogbomoso.</p>
                </div>
                <Link href="/search" className="flex items-center gap-2 bg-[#BEF264] text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20">
                    <Search className="w-4 h-4" /> Browse Properties
                </Link>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Transacted', value: `₦${escrowStats.total.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'In Escrow (Held)', value: `₦${escrowStats.held.toLocaleString()}`, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Released', value: `₦${escrowStats.released.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-white/5 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-all">
                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { name: 'Rent a Place', href: '/rent', icon: Home, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                    { name: 'Buy Property', href: '/buy', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { name: 'Shop/Office', href: '/search?q=shop', icon: FileSearch, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                    { name: 'Land For Sale', href: '/search?q=land', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                ].map((link) => (
                    <Link key={link.name} href={link.href}
                        className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center gap-3">
                        <div className={`w-14 h-14 ${link.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <link.icon className={`w-7 h-7 ${link.color}`} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{link.name}</span>
                    </Link>
                ))}
            </div>

            {/* Recent Inspections */}
            <section>
                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#BEF264]" /> Recent Inspections
                </h2>
                {inspections.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-10 text-center">
                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="font-black text-gray-500 uppercase tracking-tight">No inspections booked yet</p>
                        <p className="text-gray-400 text-sm mt-1">Browse properties and request an inspection.</p>
                        <Link href="/rent" className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-[#BEF264] text-black px-6 py-3 rounded-2xl hover:bg-[#a6d456] transition-all">
                            Browse Now <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inspections.map(item => {
                            const style = statusStyle[item.status] ?? statusStyle.Pending;
                            const Icon = style.icon;
                            return (
                                <div key={item.id} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm flex items-start justify-between hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                                            <Icon className={`w-5 h-5 ${style.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white">{item.properties?.title ?? 'Property'}</h3>
                                            <div className="flex items-center gap-1 text-gray-400 text-xs font-bold mt-1">
                                                <MapPin className="w-3 h-3" /> {item.properties?.location ?? '—'}
                                            </div>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {item.scheduled_at ? new Date(item.scheduled_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date TBD'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${style.bg} ${style.color}`}>
                                        {item.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

// ===================== REQUESTS TAB =====================
function RequestsTab() {
    const supabase = createClient();
    const [inspections, setInspections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInspectionToPay, setSelectedInspectionToPay] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [escrowTxs, setEscrowTxs] = useState<any[]>([]);

    const load = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUser(user);

        const [inspRes, profileRes, escrowRes] = await Promise.all([
            supabase
                .from('inspections')
                .select('id, scheduled_at, status, notes, properties(title, location, images)')
                .eq('requester_id', user.id)
                .order('created_at', { ascending: false }),
            supabase
                .from('profiles')
                .select('wallet_balance')
                .eq('id', user.id)
                .single(),
            supabase
                .from('escrow_transactions')
                .select('reference_id, status, type')
                .eq('payer_id', user.id)
        ]);
        
        setInspections(inspRes.data || []);
        setWalletBalance(profileRes.data?.wallet_balance || 0);
        setEscrowTxs(escrowRes.data || []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const statusStyle: Record<string, { color: string; bg: string }> = {
        Confirmed: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        Pending: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        Completed: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        Cancelled: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
    };

    if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-white dark:bg-neutral-900 animate-pulse rounded-3xl" />)}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">My Requests</h1>
            {inspections.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-10 text-center">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-black text-gray-500 uppercase tracking-tight">No inspection requests</p>
                    <Link href="/rent" className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-[#BEF264] text-black px-6 py-3 rounded-2xl hover:bg-[#a6d456] transition-all">
                        Browse Properties <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {inspections.map((item) => {
                        const style = statusStyle[item.status] ?? statusStyle.Pending;
                        return (
                            <div key={item.id} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white">{item.properties?.title ?? 'Property'}</h3>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs font-bold mt-1">
                                            <MapPin className="w-3 h-3" /> {item.properties?.location ?? '—'}
                                        </div>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {item.scheduled_at ? new Date(item.scheduled_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date TBD'}
                                        </p>
                                        {item.notes && <p className="text-gray-500 text-sm mt-2 italic">{item.notes}</p>}
                                        
                                        {/* Pay Button Logic */}
                                        {(item.status === 'Pending' || item.status === 'Confirmed') && (
                                            !escrowTxs.find(tx => tx.reference_id === item.id && (tx.status === 'HELD' || tx.status === 'PENDING' || tx.status === 'Held')) && (
                                                <button 
                                                    onClick={() => setSelectedInspectionToPay({ id: item.id, title: item.properties?.title ?? 'Property' })}
                                                    className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-500 underline underline-offset-2 hover:text-emerald-600 transition-colors block"
                                                >
                                                    Pay ₦2,000 Escrow To Secure
                                                </button>
                                            )
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${style.bg} ${style.color}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <PayInspectionModal
                isOpen={!!selectedInspectionToPay}
                onClose={() => setSelectedInspectionToPay(null)}
                inspectionId={selectedInspectionToPay?.id || ''}
                propertyName={selectedInspectionToPay?.title || ''}
                inspectionFee={2000}
                walletBalance={walletBalance}
                user={currentUser}
                onSuccess={() => {
                    load();
                    setSelectedInspectionToPay(null);
                }}
            />
        </div>
    );
}

// ===================== SAVED TAB =====================
function SavedTab() {
    const supabase = createClient();
    const [saved, setSaved] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from('saved_properties')
                .select('id, created_at, properties(id, title, location, price, images)')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });
            setSaved(data || []);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-28 bg-white dark:bg-neutral-900 animate-pulse rounded-3xl" />)}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Saved Properties</h1>
            {saved.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-10 text-center">
                    <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-black text-gray-500 uppercase tracking-tight">Nothing saved yet</p>
                    <Link href="/rent" className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-[#BEF264] text-black px-6 py-3 rounded-2xl hover:bg-[#a6d456] transition-all">
                        Browse Properties <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {saved.map((item) => (
                        <Link key={item.id} href={`/property/${item.properties?.id}`} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all block group">
                            <h3 className="font-black text-gray-900 dark:text-white group-hover:text-[#BEF264] transition-colors">{item.properties?.title}</h3>
                            <div className="flex items-center gap-1 text-gray-400 text-xs font-bold mt-1">
                                <MapPin className="w-3 h-3" /> {item.properties?.location ?? '—'}
                            </div>
                            <p className="text-[#0D9488] font-black text-lg mt-2">₦{Number(item.properties?.price).toLocaleString()}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ===================== MAIN PAGE =====================
function NonStudentDashboardContent() {
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);
    const tab = searchParams.get('tab') || 'overview';

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }: any) => {
            if (user) setUserId(user.id);
        });
    }, []);

    return (
        <>
            {tab === 'overview' && <DashboardOverview />}
            {tab === 'requests' && <RequestsTab />}
            {tab === 'saved' && <SavedTab />}
            {tab === 'wallet' && userId && <BuyerWalletTab userId={userId} />}
            {tab === 'messages' && userId && <MessagingTab userId={userId} userRole="buyer" />}
            {tab === 'profile' && (
                <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <ProfileSettings />
                </div>
            )}
            {tab === 'support' && (
                <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <SupportHub />
                </div>
            )}
        </>
    );
}

export default function NonStudentDashboard() {
    return (
        <Suspense fallback={<div className="animate-pulse" />}>
            <NonStudentDashboardContent />
        </Suspense>
    );
}
