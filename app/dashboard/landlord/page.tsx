'use client';
export const runtime = 'edge';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Building2, Eye, CreditCard, ShieldCheck, Plus, AlertCircle, Calendar, MapPin, UploadCloud, Home, MessageSquare, Wallet, Clock, CheckCircle2, Zap, Lock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ListingStudio } from '@/components/dashboard/ListingStudio';
import { DetailedProfileForm } from '@/components/dashboard/DetailedProfileForm';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import LandlordListingsTab from '@/components/dashboard/LandlordListingsTab';
import InspectionsTab from '@/components/dashboard/InspectionsTab';
import MessagingTab from '@/components/dashboard/MessagingTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import { SupportHub } from '@/components/messages/SupportHub';
import { WalletOverviewCards } from '@/components/shared/WalletOverviewCards';
import { WithdrawalModal } from '@/components/dashboard/WithdrawalModal';

type Property = {
    id: string;
    title: string;
    category: string;
    listing_type: string;
    price: number;
    location: string;
    verification_status: string;
    view_count: number;
    is_active: boolean;
    status: string;
    images: string[];
    created_at: string;
};

type AccountData = {
    full_name: string;
    contact_name?: string;
    is_verified: boolean;
    subscription_plan: string;
    total_listings: number;
};

type Inspection = {
    id: string;
    scheduled_at: string;
    status: string;
    requester_type: string;
    inspection_fee: number;
    properties: { title: string; location: string } | null | any;
};

type EscrowTx = {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    agency_fee: number;
    properties: { title: string } | null | any;
};

const statusBadge: Record<string, string> = {
    Verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Live_View: 'bg-blue-50 text-blue-700 border border-blue-200',
    Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    Rejected: 'bg-red-50 text-red-700 border border-red-200',
};

const inspStyle: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
    Confirmed: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    Pending: { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    Completed: { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2 },
    Cancelled: { color: 'text-red-600', bg: 'bg-red-50', icon: Clock },
};

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'overview';

    const handleTabChange = (tab: string) => {
        if (tab === 'listings') {
            setIsAddingNew(false);
            setEditId(null);
        }
        router.push(`/dashboard/landlord?tab=${tab}`);
    };

    const supabase = createClient();
    const [account, setAccount] = useState<AccountData | null>(null);
    const [isApproved, setIsApproved] = useState(false);
    const [complianceSubmitted, setComplianceSubmitted] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [escrowTxs, setEscrowTxs] = useState<EscrowTx[]>([]);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<EscrowTx | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setUserId(user.id);

            const [accRes, propsRes, profileRes] = await Promise.all([
                supabase.from('landlord_accounts').select('id, full_name, contact_name, is_approved, compliance_submitted, business_name, phone, whatsapp_number, logo_url, is_verified, subscription_plan, total_listings, bank_name, account_number, account_name, contact_email, office_state, office_lga, office_address, about_organization, services_provided, facebook_url, twitter_url, linkedin_url, instagram_url, govt_id_url, cac_document_url').eq('id', user.id).maybeSingle(),
                supabase.from('properties').select('*').or(`owner_id.eq.${user.id},landlord_id.eq.${user.id}`).order('created_at', { ascending: false }),
                supabase.from('profiles').select('terms_accepted_at, wallet_balance').eq('id', user.id).maybeSingle()
            ]);

            if (accRes.error) console.error("Landlord fetch error:", accRes.error);
            if (propsRes.error) console.error("Properties fetch error:", propsRes.error);
            if (profileRes.error) console.error("Profiles fetch error:", profileRes.error);

            if (!accRes.data) {
                console.error("No landlord account found. Prompting user to complete profile.");
                if (activeTab !== 'profile') {
                    router.push('/dashboard/landlord?tab=profile');
                }
                return;
            }

            setAccount(accRes.data);
            setIsApproved(accRes.data?.is_approved || accRes.data?.is_verified || false);
            setComplianceSubmitted(accRes.data?.compliance_submitted ?? false);
            setProperties(propsRes.data ?? []);
            setTermsAccepted(!!profileRes.data?.terms_accepted_at);
            setWalletBalance(Number(profileRes.data?.wallet_balance || 0));
        } catch (error) {
            console.error("Dashboard loading error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [supabase]);

    // Load inspections when tab changes to inspections
    useEffect(() => {
        if (activeTab !== 'inspections' || !userId) return;
        async function loadInspections() {
            const propertyIds = properties.map(p => p.id);
            if (propertyIds.length === 0) return;
            const { data } = await supabase
                .from('inspections')
                .select('id, scheduled_at, status, requester_type, inspection_fee, properties(title, location)')
                .in('property_id', propertyIds)
                .order('scheduled_at', { ascending: false })
                .limit(20);
            setInspections(data ?? []);
        }
        loadInspections();
    }, [activeTab, userId, properties, supabase]);

    // Load wallet/escrow when tab changes to wallet
    useEffect(() => {
        if (activeTab !== 'wallet' || !userId) return;
        async function loadWallet() {
            const { data } = await supabase
                .from('escrow_transactions')
                .select('id, amount, status, created_at, agency_fee, properties(title)')
                .or(`landlord_id.eq.${userId},payee_id.eq.${userId},seller_id.eq.${userId}`)
                .order('created_at', { ascending: false })
                .limit(20);
            setEscrowTxs(data ?? []);
        }
        loadWallet();
    }, [activeTab, userId, supabase]);

    const totalViews = properties.reduce((sum, p) => sum + (p.view_count ?? 0), 0);
    const liveCount = properties.filter(p => p.verification_status === 'Verified' || p.verification_status === 'Live View').length;
    const totalEarned = escrowTxs.filter(e => e.status === 'Released').reduce((s, e) => s + Number(e.amount), 0);
    const lockedFunds = escrowTxs.filter(e => e.status === 'Locked' || e.status === 'Held').reduce((s, e) => s + Number(e.amount), 0);

    const renderOverview = () => (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                        {account?.full_name ?? 'Landlord Hub'}
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your properties and earnings in Ogbomoso.</p>
                </div>
                <button
                    onClick={() => {
                        handleTabChange('listings');
                        setIsAddingNew(true);
                    }}
                    className="flex items-center gap-2 bg-[#BEF264] text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20"
                >
                    <Plus className="w-4 h-4" />
                    New Listing
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                {[
                    { label: 'Active Listings', value: loading ? '...' : String(liveCount), icon: Building2 },
                    { label: 'Total Views', value: loading ? '...' : totalViews.toLocaleString(), icon: Eye },
                    { label: 'Total Properties', value: loading ? '...' : String(properties.length), icon: CreditCard },
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#BEF264]/30 transition-all">
                        <div>
                            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-black text-gray-900">{stat.value}</h3>
                        </div>
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#BEF264]/10 transition-colors">
                            <stat.icon className="w-7 h-7 text-gray-400 group-hover:text-[#BEF264] transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Verification Banner */}
            {account && !isApproved && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start mt-8">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-black text-amber-900 uppercase tracking-tight text-sm">Account Verification Pending</p>
                        <p className="text-amber-700 text-sm mt-1 font-medium">Submit your NIN and proof-of-ownership to unlock full listing capabilities and receive escrow payments.</p>
                    </div>
                </div>
            )}

            {/* Listings */}
            <section className="mt-8">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#BEF264]" />
                    My Properties
                </h2>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-3xl" />)}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center space-y-4">
                        <Building2 className="w-12 h-12 text-gray-200 mx-auto" />
                        <p className="font-black text-gray-500 uppercase tracking-tight">No properties listed yet</p>
                        <button onClick={() => handleTabChange('listings')} className="inline-flex items-center gap-2 bg-black text-[#BEF264] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all">
                            <Plus className="w-4 h-4" /> List a Property
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {properties.map(p => (
                            <Link key={p.id} href={`/property/${p.id}`} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group block">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#BEF264]/10 transition-colors">
                                        <Building2 className="w-6 h-6 text-gray-400 group-hover:text-[#BEF264] transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-tight">{p.title}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {p.location} · {p.category}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-black text-gray-900">₦{Number(p.price).toLocaleString()}</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase">{p.listing_type}</p>
                                    </div>
                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${statusBadge[p.verification_status] ?? statusBadge.Pending}`}>
                                        {p.verification_status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </>
    );

    // renderInspections replaced by InspectionsTab component

    const renderWallet = () => (
        <section>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">My Wallet</h2>
            {/* Wallet summary cards */}
            <div className="mb-8">
                <WalletOverviewCards 
                    availableBalance={walletBalance} 
                    escrowBalance={lockedFunds} 
                    totalVolume={totalEarned} 
                    role="seller" 
                    onWithdraw={() => setShowWithdrawalModal(true)}
                />
            </div>
            {escrowTxs.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="font-black text-gray-500 uppercase tracking-tight">No transactions yet</p>
                    <p className="text-gray-400 text-sm mt-2">Escrow payments for your properties will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {escrowTxs.map(tx => (
                        <div 
                            key={tx.id} 
                            onClick={() => setSelectedTx(tx)}
                            className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between cursor-pointer hover:border-[#BEF264]/50 hover:shadow-md transition-all group"
                        >
                            <div>
                                <p className="font-black text-gray-900 text-sm group-hover:text-[#BEF264] transition-colors">{tx.properties?.title ?? 'Property'}</p>
                                <p className="text-xs text-gray-400 font-bold mt-0.5">{new Date(tx.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-gray-900">₦{Number(tx.amount).toLocaleString()}</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${tx.status === 'Released' ? 'bg-emerald-50 text-emerald-700' : tx.status === 'Locked' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Transaction Details Modal */}
            {selectedTx && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setSelectedTx(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
                        >
                            ✕
                        </button>
                        <div className="p-5">
                            <div className="w-16 h-16 bg-[#BEF264]/20 rounded-2xl flex items-center justify-center mb-6">
                                <Wallet className="w-8 h-8 text-[#BEF264]" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-1">Transaction Details</h3>
                            <p className="text-gray-500 font-medium text-sm mb-8">Ref: {selectedTx.id}</p>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Amount</span>
                                    <span className="font-black text-gray-900">₦{Number(selectedTx.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Target Property</span>
                                    <span className="font-bold text-gray-700">{selectedTx.properties?.title || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Date</span>
                                    <span className="font-bold text-gray-700">{new Date(selectedTx.created_at).toLocaleString('en-NG')}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Status</span>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${selectedTx.status === 'Released' ? 'bg-emerald-50 text-emerald-700' : selectedTx.status === 'Locked' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {selectedTx.status}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedTx(null)}
                                className="w-full bg-black text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs mt-8 hover:bg-neutral-800 transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <WithdrawalModal 
                    userId={userId as string} 
                    onClose={() => setShowWithdrawalModal(false)} 
                    onSuccess={(newBalance) => {
                        setWalletBalance(newBalance);
                        setShowWithdrawalModal(false);
                    }} 
                />
            )}
        </section>
    );


    const renderMessages = () => (
        <section>
            <MessagingTab userId={userId as string} userRole="landlord" />
        </section>
    );

    const renderRestrictedAccess = (title: string, requiredFor: string) => (
        <div className="max-w-3xl mx-auto rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm mt-8">
            <div className="bg-[#cc3300] p-6 sm:p-5 flex items-start gap-4 text-white">
                <ShieldCheck className="w-8 h-8 shrink-0 mt-1 text-white" />
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Legal & Compliance Guard Active</h2>
                    <p className="text-white/90 mt-2 text-sm sm:text-base leading-relaxed">
                        To maintain a safe environment on HOSTELPULSE, all Agents and Landlords must accept the <b>Professional Terms</b> and submit valid means of identity before {requiredFor}.
                    </p>
                </div>
            </div>
            <div className="p-5 sm:p-12 text-center bg-white">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Access Restricted</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">You must complete your profile and upload compliance documents to unlock the {title} module.</p>
                
                <button 
                    onClick={() => handleTabChange('profile')}
                    className="bg-black text-[#BEF264] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all inline-flex items-center gap-2"
                >
                    Complete Profile Now <UploadCloud className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {loading ? (
                <div className="p-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#BEF264] border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <>
                    {activeTab === 'overview' && renderOverview()}
                    
                    {activeTab === 'profile' && (
                        <div className="bg-white p-6 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5">
                            <DetailedProfileForm account={account} userId={userId as string} />
                        </div>
                    )}
                    
                    {activeTab === 'listings' && (
                        isApproved ? (
                            <div className="bg-white p-6 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
                                { (isAddingNew || properties.length === 0 || editId) ? (
                                    <ListingStudio 
                                        editId={editId}
                                        onComplete={() => {
                                            setIsAddingNew(false);
                                            setEditId(null);
                                            loadData();
                                        }} 
                                    />
                                ) : (
                                    <LandlordListingsTab 
                                        userId={userId as string}
                                        properties={properties}
                                        onAddClick={() => setIsAddingNew(true)}
                                        onEditClick={(id) => setEditId(id)}
                                        onRefresh={loadData}
                                    />
                                )}
                            </div>
                        ) : renderRestrictedAccess('Listing Studio', 'listing properties')
                    )}
                    
                    {activeTab === 'inspections' && (
                        isApproved ? <InspectionsTab userId={userId as string} /> : renderRestrictedAccess('Inspections', 'managing property inspections')
                    )}
                    
                    {activeTab === 'wallet' && (
                        isApproved ? renderWallet() : renderRestrictedAccess('Wallet', 'receiving or withdrawing escrow funds')
                    )}
                    
                    {activeTab === 'messages' && (
                        isApproved ? renderMessages() : renderRestrictedAccess('Messages', 'communicating with tenants')
                    )}
                    
                    {activeTab === 'analytics' && (
                        isApproved ? <AnalyticsTab userId={userId as string} /> : renderRestrictedAccess('Analytics', 'viewing property performance')
                    )}

                    {activeTab === 'support' && (
                        <div className="bg-white p-6 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <SupportHub />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function LandlordDashboard() {
    return (
        <Suspense fallback={<div className="p-6 text-center animate-pulse tracking-widest font-black uppercase text-gray-400">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
