'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Wallet, Trophy, MapPin, CheckCircle2, Clock, AlertCircle, Zap, X } from 'lucide-react';
import Link from 'next/link';

type Inspection = {
    id: string;
    scheduled_at: string;
    status: string;
    inspection_fee: number;
    properties: { title: string; location: string } | null | any;
};

type AgentAccount = {
    full_name: string;
    zone: string;
    rank: string;
    deals_closed: number;
    wallet_balance: number;
    completed_tours: number;
    is_approved: boolean;
};

const statusStyle: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
    Confirmed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
    Pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
    Completed: { color: 'text-[#BEF264]', bg: 'bg-[#BEF264]/10', icon: CheckCircle2 },
    Cancelled: { color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle },
};

const rankColors: Record<string, string> = {
    Bronze: 'text-orange-400',
    Silver: 'text-gray-300',
    Gold: 'text-yellow-400',
    Platinum: 'text-[#BEF264]',
};

import { useSearchParams, useRouter } from 'next/navigation';
import { MessageList } from '@/components/messages/MessageList';
import MyZoneTab from '@/components/dashboard/MyZoneTab';
import { ListingStudio } from '@/components/dashboard/ListingStudio';
import InspectionsTab from '@/components/dashboard/InspectionsTab';
import WalletTab from '@/components/dashboard/WalletTab';
import MessagingTab from '@/components/dashboard/MessagingTab';
import LeaderboardTab from '@/components/dashboard/LeaderboardTab';
import { DetailedProfileForm } from '@/components/dashboard/DetailedProfileForm';
import { AgentDashboardShell } from '@/components/layout/AgentDashboardShell';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import { SupportHub } from '@/components/messages/SupportHub';

function AgentDashboardContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'overview';
    const [account, setAccount] = useState<AgentAccount | null>(null);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [
                { data: profile },
                { data: acc }, 
                { data: insp },
                { count: toursCount },
                { count: escrowDeals }
            ] = await Promise.all([
                supabase.from('profiles').select('wallet_balance').eq('id', user.id).single(),
                supabase.from('agent_accounts').select('*').eq('id', user.id).single(),
                supabase.from('inspections')
                    .select('id, scheduled_at, status, inspection_fee, properties(title, location)')
                    .eq('agent_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(8),
                supabase.from('inspections')
                    .select('*', { count: 'exact', head: true })
                    .eq('agent_id', user.id)
                    .eq('status', 'Completed'),
                supabase.from('escrow_transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('payee_id', user.id)
                    .or('status.eq.Released,status.eq.completed')
            ]);

            if (!acc) {
                console.warn("No agent account found for user, redirecting to onboarding.");
                router.push('/onboarding');
                return;
            }

            // Sync account with real tour count and true wallet balance from profiles
            const syncedAccount = {
                ...acc,
                wallet_balance: profile?.wallet_balance || 0,
                deals_closed: (acc.deals_closed || 0) + (escrowDeals || 0),
                completed_tours: toursCount || 0
            };

            setAccount(syncedAccount);
            setInspections(insp ?? []);
            setUserId(user.id);
            setLoading(false);
        }
        loadData();
    }, [supabase]);

    const earnedToday = inspections
        .filter(i => i.status === 'Completed')
        .reduce((sum, i) => sum + (i.inspection_fee ?? 2000), 0);

    const renderOverview = () => (
        <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Wallet Balance', value: loading ? '...' : `₦${Number(account?.wallet_balance ?? 0).toLocaleString()}`, icon: Wallet },
                    { label: 'Deals Closed', value: loading ? '...' : String(account?.deals_closed ?? 0), icon: Trophy },
                    { label: 'Total Tours', value: loading ? '...' : String(account?.completed_tours ?? 0), icon: Calendar },
                    { label: 'Earned Today', value: loading ? '...' : `₦${earnedToday.toLocaleString()}`, icon: Zap },
                ].map(stat => (
                    <div key={stat.label} className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-3xl flex flex-col gap-4 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                        <stat.icon className="w-6 h-6 text-[#0D9488] dark:text-[#BEF264]" />
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inspections Queue */}
            <section className="mt-10">
                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#0D9488] dark:text-[#BEF264]" />
                    Inspection Queue
                </h2>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="bg-white/5 animate-pulse h-20 rounded-2xl" />) }
                    </div>
                ) : inspections.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl p-10 text-center">
                        <Calendar className="w-10 h-10 text-gray-200 dark:text-white/10 mx-auto mb-3" />
                        <p className="font-black text-gray-500 uppercase tracking-tight">No inspections assigned yet</p>
                        <p className="text-gray-600 text-sm mt-1">Inspections will appear here once you are assigned by HQ.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {inspections.map(item => {
                            const style = statusStyle[item.status] ?? statusStyle.Pending;
                            const Icon = style.icon;
                            return (
                                <div key={item.id} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-5 rounded-2xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg}`}>
                                            <Icon className={`w-5 h-5 ${style.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white text-sm">{item.properties?.title ?? 'Property'}</h3>
                                            <div className="flex items-center gap-1 text-gray-500 text-xs font-bold mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {item.properties?.location ?? '—'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-black uppercase tracking-widest ${style.color}`}>{item.status}</p>
                                        <p className="text-[#0D9488] dark:text-[#BEF264] font-black text-sm mt-0.5">₦{Number(item.inspection_fee).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );

    return (
        <AgentDashboardShell userId={userId || ''}>
            <div className="space-y-12">
                {/* Header Context */}
                <div className="mb-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BEF264] mb-2">Agent HQ / {activeTab}</p>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        {activeTab === 'overview' ? `Welcome, ${account?.full_name?.split(' ')[0]}` : activeTab}
                    </h1>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && renderOverview()}
                
                {activeTab === 'inspections' && userId && (
                    <InspectionsTab userId={userId} />
                )}

                {activeTab === 'wallet' && userId && account && (
                    <WalletTab userId={userId} agentAccount={account} />
                )}
                
                {activeTab === 'messages' && userId && (
                    <MessagingTab userId={userId} userRole="agent" />
                )}

                {activeTab === 'zone' && userId && (
                    <MyZoneTab 
                        userId={userId} 
                        onAddClick={() => {
                            setEditingPropertyId(null);
                            setIsAddModalOpen(true);
                        }} 
                        onEditClick={(id) => {
                            setEditingPropertyId(id);
                            setIsAddModalOpen(true);
                        }}
                    />
                )}

                {activeTab === 'leaderboard' && userId && (
                    <LeaderboardTab userId={userId} />
                )}

                {activeTab === 'profile' && userId && account && (
                    <div className="bg-white dark:bg-neutral-950 p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <DetailedProfileForm account={account} userId={userId} />
                    </div>
                )}
                
                {activeTab === 'analytics' && userId && (
                    <AnalyticsTab userId={userId} />
                )}
                
                {activeTab === 'support' && (
                    <div className="bg-white dark:bg-neutral-950 p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <SupportHub />
                    </div>
                )}
                
                {isAddModalOpen && userId && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="w-full max-w-4xl bg-white dark:bg-neutral-950 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="absolute top-8 right-8 z-[160]">
                                <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
                                <ListingStudio 
                                    editId={editingPropertyId}
                                    onComplete={() => {
                                        setIsAddModalOpen(false);
                                        window.location.reload();
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AgentDashboardShell>
    );
}

export default function AgentDashboard() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#0F172A]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white dark:border-[#BEF264]" />
            </div>
        }>
            <AgentDashboardContent />
        </Suspense>
    );
}
