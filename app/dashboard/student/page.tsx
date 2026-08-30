export const runtime = 'edge';
'use client';

import { motion, AnimatePresence } from 'framer-motion';

import { useEffect, useState, useRef, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Clock, CheckCircle2, Heart, Search, MapPin, Star, Users, GraduationCap, ShoppingBag, DollarSign, ShieldCheck, Camera, Loader2, Wallet, X } from 'lucide-react';
import { SellerTrustBadge, getTrustLevel } from '@/components/ui/trust-badge';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { QRScanner } from '@/components/market/QRScanner';
import { ReviewRoom } from '@/components/market/ReviewRoom';
import { useSaved } from '@/components/providers/SavedProvider';
import PropertyCard from '@/components/ui/PropertyCard';
import { DetailedProfileForm } from '@/components/dashboard/DetailedProfileForm';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import BuyerWalletTab from '@/components/dashboard/BuyerWalletTab';
import { SupportHub } from '@/components/messages/SupportHub';
import { CampusMarketHub } from '@/components/dashboard/CampusMarketHub';
import { MessageList } from '@/components/messages/MessageList';
import PayInspectionModal from '@/components/dashboard/PayInspectionModal';
import { SavedPropertiesTab } from '@/components/dashboard/SavedPropertiesTab';
import { RoommatesTab } from '@/components/dashboard/RoommatesTab';
import Loading from '@/app/loading';

type Inspection = {
    id: string;
    scheduled_at: string;
    status: string;
    agent_id: string;
    properties: { title: string; location: string } | null | any;
};

type SavedProperty = {
    id: string;
    property_id: string;
    properties: { id: string; title: string; location: string; price: number; images: string[] } | null | any;
};

const statusStyle: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
    Confirmed: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    Pending: { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    Completed: { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2 },
    Cancelled: { color: 'text-red-600', bg: 'bg-red-50', icon: Clock },
};

function StudentDashboardContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
    const [fullName, setFullName] = useState('');
    const [lookingForRoommate, setLookingForRoommate] = useState(false);
    const [trustLevel, setTrustLevel] = useState('');
    const [sales, setSales] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [reviewItem, setReviewItem] = useState<{ id: string; title: string; sellerId: string; buyerId: string } | null>(null);
    const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
    const [accountData, setAccountData] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedInspectionToPay, setSelectedInspectionToPay] = useState<{ id: string; title: string } | null>(null);
    const [selectedInspectionDetails, setSelectedInspectionDetails] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('Overview');
    const [refreshCount, setRefreshCount] = useState(0);
    const { savedIds } = useSaved();

    const inspectionsRef = useRef<HTMLDivElement>(null);
    const savedRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            const user = session.user;
            setCurrentUser(user);

            setFullName(user.user_metadata?.full_name?.split(' ')[0] ?? '');

            const [{ data: insp }, { data: saved }, { data: account }] = await Promise.all([
                supabase
                    .from('inspections')
                    .select('id, scheduled_at, status, agent_id, properties(title, location)')
                    .eq('requester_id', user.id)
                    .order('scheduled_at', { ascending: true })
                    .limit(6),
                supabase
                    .from('saved_properties')
                    .select('id, property_id, properties(id, title, location, price, images)')
                    .eq('student_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(6),
                supabase
                    .from('student_accounts')
                    .select('*, looking_for_roommate, avatar_url')
                    .eq('id', user.id)
                    .single()
            ]);

            if (!account) {
                router.push('/dashboard');
                return;
            }

            setInspections(insp ?? []);
            setSavedProperties(saved ?? []);
            setLookingForRoommate(account?.looking_for_roommate ?? false);
            setAvatarUrl(account?.avatar_url ?? null);
            setAccountData(account);

            // Fetch Trust Rank via RPC for REAL verified sales
            const { data: realSales } = await supabase
                .rpc('get_verified_sales', { seller_uuid: user.id });
            
            setSales(realSales || 0);

            const [{ data: profile }, { count: reviewCount }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('avg_rating, wallet_balance')
                    .eq('id', user.id)
                    .single(),
                supabase
                    .from('reviews')
                    .select('*', { count: 'exact', head: true })
                    .eq('seller_id', user.id)
            ]);
            
            if (profile) {
                const dynamicLevel = getTrustLevel(realSales || 0, Number(profile.avg_rating) || 0, reviewCount || 0);
                setTrustLevel(dynamicLevel);
            }

            // Fetch pending confirmations (Locked Market Items OR Held Rent Escrows)
            const { data: pending } = await supabase
                .from('escrow_transactions')
                .select(`
                    id, item_id, property_id, amount, reference_id, type, dispute_status,
                    market_listings(title, seller_id),
                    properties(title),
                    agent:agent_accounts!agent_id(id, whatsapp_number, phone)
                `)
                .eq('payer_id', user.id)
                .or('status.eq.Locked,status.eq.Held,status.eq.pending,status.eq.Pending');
            
            setPendingTransactions(pending || []);
            const escrowBalance = pending?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
            setAccountData({ ...account, escrowBalance, wallet_balance: profile?.wallet_balance || 0 });

            setLoading(false);
        }
        loadData();
    }, [supabase, refreshCount]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'inspections') {
            setActiveTab('Inspections');
        } else if (tab === 'saved') {
            setActiveTab('Saved');
        } else if (tab === 'roommates') {
            setActiveTab('Roommates');
        } else if (tab === 'profile') {
            setActiveTab('Profile');
        } else if (tab === 'wallet') {
            setActiveTab('Wallet');
        } else if (tab === 'market') {
            setActiveTab('Market');
        } else if (tab === 'support') {
            setActiveTab('Support');
        } else if (tab === 'messages') {
            setActiveTab('Messages');
        } else {
            setActiveTab('Overview');
        }
    }, [searchParams, loading]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload image
            const { error: uploadError } = await supabase.storage
                .from('market-images') 
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('market-images')
                .getPublicUrl(filePath);

            // Update student_accounts
            const { error: updateError } = await supabase
                .from('student_accounts')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;
            
            // Also update the trust profile
            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            setAvatarUrl(publicUrl);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="space-y-16 pb-20 md:pb-0">
            {/* Welcome Section moved to Profile Tab */}

            {/* Modals & Overlays */}
            <PayInspectionModal
                isOpen={!!selectedInspectionToPay}
                onClose={() => setSelectedInspectionToPay(null)}
                inspectionId={selectedInspectionToPay?.id || ''}
                propertyName={selectedInspectionToPay?.title || ''}
                inspectionFee={2000}
                walletBalance={Number(accountData?.wallet_balance || 0)}
                user={currentUser}
                onSuccess={() => {
                    setRefreshCount(prev => prev + 1);
                    setSelectedInspectionToPay(null);
                }}
            />

            {/* Inspection Details Modal */}
            <AnimatePresence>
                {selectedInspectionDetails && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedInspectionDetails(null)}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl pointer-events-auto border border-gray-100 dark:border-white/5 space-y-4"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">Inspection Details</h3>
                                    <button onClick={() => setSelectedInspectionDetails(null)} className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700">
                                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>
                                <div className="space-y-4 text-sm font-medium">
                                    <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl">
                                        <div className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1">Property</div>
                                        <div className="font-bold text-gray-900 dark:text-white">{selectedInspectionDetails.properties?.title || 'Unknown Property'}</div>
                                        <div className="flex items-center gap-1 text-gray-400 mt-1"><MapPin className="w-3 h-3"/> {selectedInspectionDetails.properties?.location || 'Unknown Location'}</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl">
                                        <div className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1">Schedule</div>
                                        <div className="font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Clock className="w-4 h-4 text-gray-400"/> {selectedInspectionDetails.scheduled_at ? new Date(selectedInspectionDetails.scheduled_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl">
                                        <div className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1">Status & Fee</div>
                                        <div className="font-bold flex items-center justify-between text-gray-900 dark:text-white">
                                            <span>₦2,000</span>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle[selectedInspectionDetails.status]?.bg || ''} ${statusStyle[selectedInspectionDetails.status]?.color || ''}`}>
                                                {selectedInspectionDetails.status}
                                            </span>
                                        </div>
                                        {selectedInspectionDetails.tx?.dispute_status === 'OPEN' && (
                                            <div className="mt-2 text-red-500 text-xs font-bold uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded-lg inline-block">Frozen / Disputed</div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button 
                                        onClick={() => {
                                            router.push(`?tab=messages&userId=${selectedInspectionDetails.agent_id}`);
                                            setSelectedInspectionDetails(null);
                                        }}
                                        className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/10"
                                    >
                                        Message Landlord
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Tab Navigation Removed - Using Sidebar Instead */}

            {activeTab === 'Overview' ? (
                <>
                    {/* New Professional Buyer Hub Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => setActiveTab('Inspections')}
                            className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 shadow-sm p-6 rounded-[2rem] flex flex-col gap-4 text-left hover:scale-105 transition-transform active:scale-95"
                        >
                            <Calendar className="w-6 h-6 text-[#BEF264]" />
                            <div>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">
                                    {inspections.filter(i => i.status === 'Pending').length}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Pending Inspections</p>
                            </div>
                        </button>
                        
                        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 shadow-sm p-6 rounded-[2rem] flex flex-col gap-4">
                            <Wallet className="w-6 h-6 text-[#BEF264]" />
                            <div>
                                <p className="text-3xl font-black text-gray-900 dark:text-white text-emerald-500">
                                    ₦{Number(accountData?.wallet_balance || 0).toLocaleString()}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Available Balance</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 shadow-sm p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden">
                            <ShieldCheck className={`w-8 h-8 ${accountData?.is_approved ? 'text-[#BEF264]' : 'text-gray-400'}`} />
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {accountData?.is_approved ? 'Verified Member' : 'Unverified'}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                                    {accountData?.is_approved ? 'Full Platform Access' : 'Action Required in Profile'}
                                </p>
                            </div>
                            {!accountData?.is_approved && (
                                <div className="absolute top-4 right-4 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Saved Hostels */}
                    <section ref={savedRef}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                Saved Hostels
                            </h2>
                            <Link href="/dashboard/student?tab=saved" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                Browse More →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-gray-100 dark:bg-neutral-900 animate-pulse aspect-square rounded-[2rem]" />
                                ))}
                            </div>
                        ) : savedProperties.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl p-10 text-center">
                                <Heart className="w-10 h-10 text-gray-200 dark:text-neutral-800 mx-auto mb-3" />
                                <p className="font-black text-gray-400 uppercase tracking-tight text-sm">No saved hostels yet</p>
                                <p className="text-gray-400 text-xs mt-1">Tap ❤️ on any hostel to save it here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedProperties.map((item) => {
                                    if (!item.properties) return null;
                                    const p = item.properties;
                                    return (
                                        <Link key={item.id} href={`/property/${p.id}`} className="block group">
                                            <PropertyCard
                                                id={p.id}
                                                title={p.title}
                                                location={p.location}
                                                price={`₦${Number(p.price).toLocaleString()}`}
                                                rating={4.8}
                                                image={p.images?.[0] ?? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5'}
                                                verified={true}
                                                priceLabel="Yearly Rent"
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Area Guides Card */}
                    <section>
                        <div className="bg-gradient-to-br from-black to-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#BEF264] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" />
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                <div className="max-w-xl">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                                        Area Guides
                                    </h2>
                                    <p className="text-gray-400 font-medium leading-relaxed">
                                        Explore local student neighborhoods in Ogbomoso. Get descriptions, security ratings, and distance info for Under-G, Adenike, Aroje, and more.
                                    </p>
                                </div>
                                <Link 
                                    href="/area-guide"
                                    className="shrink-0 bg-[#BEF264] text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20 hover:scale-105 active:scale-95"
                                >
                                    Explore Areas
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Modals */}
                    {showScanner && (
                        <QRScanner 
                            onSuccess={async (tid) => {
                                try {
                                    const trans = pendingTransactions.find(t => t.id === tid);
                                    if (trans) {
                                        if (trans.item_id) {
                                            // Handle Marketplace Handshake
                                            setReviewItem({
                                                id: trans.item_id,
                                                title: trans.market_listings.title,
                                                sellerId: trans.market_listings.seller_id,
                                                buyerId: (await supabase.auth.getUser()).data.user?.id || ''
                                            });
                                        } else if (trans.property_id) {
                                            // Handle Rent/Move-in Handshake
                                            const { data, error } = await supabase.rpc('release_escrow_funds', { tx_id: tid });
                                            
                                            if (!error && (data as any)?.success) {
                                                // Trigger WhatsApp notification for Agent
                                                const agentPhone = trans.agent?.whatsapp_number || trans.agent?.phone;
                                                if (agentPhone) {
                                                    await supabase.from('messages_queue').insert({
                                                        user_id: trans.agent.id,
                                                        phone_number: agentPhone.replace(/\D/g, ''),
                                                        message_body: `Kpa Confirmed! 💰 The student has scanned your move-in QR. ₦${Number(trans.amount).toLocaleString()} is now available for withdrawal in your HOSTELPULSE Wallet.`,
                                                        status: 'pending'
                                                    });
                                                }
                                                alert("Move-in Confirmed! 🎉 Funds have been released to the agent.");
                                            } else {
                                                alert("Handshake failed: " + (error?.message || (data as any)?.message || "Unknown error"));
                                            }
                                        }
                                    }
                                } catch (err) {
                                    console.error("Scanner Error:", err);
                                } finally {
                                    setShowScanner(false);
                                    window.location.reload(); 
                                }
                            }}
                            onClose={() => setShowScanner(false)}
                        />
                    )}

                    {reviewItem && (
                        <ReviewRoom 
                            item={{ id: reviewItem.id, title: reviewItem.title }}
                            sellerId={reviewItem.sellerId}
                            sellerName="the Seller"
                            buyerId={reviewItem.buyerId}
                            onComplete={() => {
                                setReviewItem(null);
                                window.location.reload();
                            }}
                            onClose={() => setReviewItem(null)}
                        />
                    )}
                </>
            ) : activeTab === 'Saved' ? (
                <SavedPropertiesTab />
            ) : activeTab === 'Inspections' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <section ref={inspectionsRef}>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#BEF264]" />
                            My Inspections
                        </h2>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-gray-100 dark:bg-neutral-900 animate-pulse h-32 rounded-3xl" />
                                ))}
                            </div>
                        ) : inspections.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl p-10 text-center">
                                <Calendar className="w-10 h-10 text-gray-300 dark:text-neutral-700 mx-auto mb-3" />
                                <p className="font-black text-gray-400 uppercase tracking-tight">No inspections yet</p>
                                <p className="text-gray-400 text-sm mt-1">Browse hostels and book your first inspection.</p>
                                <Link href="/rent" className="mt-4 inline-block text-xs font-black uppercase tracking-widest text-[#BEF264] underline underline-offset-4">
                                    Browse Hostels →
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {inspections.map((item) => {
                                    const style = statusStyle[item.status] ?? statusStyle.Pending;
                                    const Icon = style.icon;

                                    const tx = pendingTransactions.find(t => t.reference_id === item.id && t.type === 'INSPECTION_FEE');

                                    return (
                                        <div key={item.id} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex items-start justify-between hover:shadow-md transition-all">
                                            <div className="min-w-0">
                                                <h3 className="font-black text-gray-900 dark:text-white truncate">{item.properties?.title ?? 'Property'}</h3>
                                                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold mt-1 truncate">
                                                    <MapPin className="w-3 h-3" />
                                                    {item.properties?.location ?? '—'}
                                                </div>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {item.scheduled_at
                                                        ? new Date(item.scheduled_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
                                                        : 'TBD'}
                                                </p>
                                                <div className="flex gap-2 items-center mt-3">
                                                    <span className={`inline-block text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${style.bg} ${style.color}`}>
                                                        {item.status}
                                                    </span>
                                                    {tx?.dispute_status === 'OPEN' && (
                                                        <span className="inline-block text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest bg-red-100 text-red-600">
                                                            FROZEN / DISPUTED
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <button 
                                                        onClick={() => setSelectedInspectionDetails({ ...item, tx })}
                                                        className="text-[10px] font-black uppercase tracking-widest text-emerald-500 underline underline-offset-2 hover:text-emerald-600 transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                                {item.status === 'Pending' && (
                                                    <button 
                                                        onClick={() => setSelectedInspectionToPay({ id: item.id, title: item.properties?.title ?? 'Property' })}
                                                        className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#BEF264] underline underline-offset-2 block"
                                                    >
                                                        Pay to Confirm
                                                    </button>
                                                )}
                                                {item.status === 'Confirmed' && tx && tx.dispute_status !== 'OPEN' && (
                                                    <button 
                                                        onClick={async () => {
                                                            const reason = prompt("Please provide a reason for the dispute:");
                                                            if (reason) {
                                                                const { initiateEscrowDispute } = await import('@/app/actions/escrow');
                                                                const res = await initiateEscrowDispute(tx.id, reason);
                                                                if (res.error) alert(res.error);
                                                                else { alert("Dispute reported successfully!"); setRefreshCount(r => r + 1); }
                                                            }
                                                        }}
                                                        className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-500 underline underline-offset-2 hover:text-red-600 transition-colors block"
                                                    >
                                                        Report Dispute
                                                    </button>
                                                )}
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                                                <Icon className={`w-5 h-5 ${style.color}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            ) : activeTab === 'Roommates' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <RoommatesTab userId={accountData?.id} userProfile={accountData} />
                </div>
            ) : activeTab === 'Wallet' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <BuyerWalletTab userId={accountData?.id} />
                </div>
            ) : activeTab === 'Market' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CampusMarketHub />
                </div>
            ) : activeTab === 'Messages' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-4xl mx-auto">
                    <MessageList />
                </div>
            ) : activeTab === 'Support' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <SupportHub />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-white dark:bg-neutral-900 rounded-[2rem] border-4 border-white dark:border-neutral-950 shadow-2xl overflow-hidden flex items-center justify-center">
                                    {avatarUrl ? (
                                        <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <Users className="w-10 h-10 text-gray-200" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black p-2.5 rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white dark:border-neutral-950"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleAvatarUpload} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-1">Student Hub</p>
                                <h1 className="text-4xl font-black text-gray-900 dark:text-white/80 tracking-tighter leading-none italic">
                                    Welcome back{fullName ? `, ${fullName}` : ''}
                                </h1>
                                <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-wide opacity-60 italic">Find, inspect and secure your space near LAUTECH.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Link
                                href="/rent"
                                className="flex items-center gap-2 bg-[#BEF264] text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/20"
                            >
                                <Search className="w-4 h-4" />
                                Find Hostel
                            </Link>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                {pendingTransactions.length > 0 && (
                                    <button 
                                        onClick={() => setShowScanner(true)}
                                        className="flex items-center justify-center gap-2 bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] animate-bounce shadow-xl shadow-[#BEF264]/20"
                                    >
                                        <Camera className="w-4 h-4" />
                                        Confirm Delivery ({pendingTransactions.length})
                                    </button>
                                )}
                                {trustLevel && (
                                    <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 px-5 py-2.5 rounded-2xl border border-neutral-100 dark:border-white/5">
                                        <ShieldCheck className="w-4 h-4 text-[#BEF264]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Trust Rank:</span>
                                        <SellerTrustBadge level={trustLevel} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DetailedProfileForm 
                        account={accountData}
                        userId={accountData?.id}
                        onUpdate={() => setRefreshCount(prev => prev + 1)}
                    />
                </div>
            )}
        </div>
    );
}

export default function StudentDashboard() {
    return (
        <Suspense fallback={<Loading />}>
            <StudentDashboardContent />
        </Suspense>
    );
}
