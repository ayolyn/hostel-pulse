'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShoppingCart, Search, Filter, Plus, Info, ShieldCheck, MapPin, Tag, MessageCircle, Package, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

import { PostMarketItem } from './PostMarketItem';
import { EscrowCheckoutModal } from './EscrowCheckoutModal';

import { useRouter } from 'next/navigation';

import { SellerTrustBadge } from '@/components/ui/trust-badge';
import { QRGenerator } from './QRGenerator';

interface MarketItem {
    id: string;
    seller_id: string;
    title: string;
    category: string;
    price: number;
    condition: string;
    location: string;
    quantity: number;
    image_url: string;
    status: 'active' | 'sold' | 'deleted';
    created_at: string;
    seller_profile?: {
        trust_level: string;
    };
}

export function CampusMarket() {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
    const [qrTransaction, setQrTransaction] = useState<{ id: string; title: string } | null>(null);
    const [escrowStatuses, setEscrowStatuses] = useState<Record<string, string>>({});
    const [isVerified, setIsVerified] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const urlFilter = new URLSearchParams(window.location.search).get('filter');
        if (urlFilter) setFilter(urlFilter);
    }, []); // Only sync from URL once on mount

    const categories = ['All', 'Power & Light', 'Furniture', 'Appliances', 'Comfort', 'Study', 'Other', 'My Listings'];

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('student_id_url')
                    .eq('id', user.id)
                    .single();
                setIsVerified(profile?.student_id_url !== null);
            }
        }
        loadUser();

        async function fetchItems() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            let query = supabase
                .from('market_listings')
                .select('*, profiles!inner(full_name, avatar_url)')
                .order('created_at', { ascending: false });
            
            if (filter === 'My Listings') {
                if (user) {
                    query = query.eq('seller_id', user.id).neq('status', 'deleted');
                } else {
                    setItems([]);
                    setLoading(false);
                    return;
                }
            } else {
                query = query.eq('status', 'active').gt('quantity', 0);
                if (filter !== 'All') {
                    query = query.eq('category', filter);
                }
            }

            if (searchQuery) {
                query = query.ilike('title', `%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) {
                console.error('Market fetch error:', error);
            } else if (data) {
                // Map the nested profile to match the component's expectations
                const mappedData = data.map((item: any) => ({
                    ...item,
                    seller_profile: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
                }));
                setItems(mappedData);

                // Fetch Escrow Statuses for these items
                const itemIds = mappedData.map((i: any) => i.id);
                const { data: escrowData } = await supabase
                    .from('escrow_transactions')
                    .select('id, item_id, status')
                    .in('item_id', itemIds);
                
                if (escrowData) {
                    const statusMap: Record<string, string> = {};
                    const idMap: Record<string, string> = {};
                    escrowData.forEach((t: any) => {
                        statusMap[t.item_id] = t.status;
                        idMap[t.item_id] = t.id; // Map item_id to transaction_id
                    });
                    setEscrowStatuses(statusMap);
                    // Store the transaction IDs for QR generation
                    (window as any)._transactionIds = idMap;
                }
            }
            setLoading(false);
        }

        fetchItems();

        const channel = supabase
            .channel('market_listings_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'market_listings' }, () => {
                fetchItems();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [filter, searchQuery, supabase]);

    const startItemChat = async (item: MarketItem) => {
        if (!currentUser) return;
        
        // Find or create a conversation for this pair of users (Unified Community category)
        let room;
        const { data: existingRooms } = await supabase
            .from('chat_rooms')
            .select('id, participant_one_id, participant_two_id, category, market_item_id')
            .or(`participant_one_id.eq.${currentUser.id},participant_two_id.eq.${currentUser.id}`);
        
        const existingRoom = existingRooms?.find((r: any) => 
            (r.participant_one_id === currentUser.id && r.participant_two_id === item.seller_id) ||
            (r.participant_one_id === item.seller_id && r.participant_two_id === currentUser.id)
        );
 
        if (existingRoom) {
            room = existingRoom;
            // Update market_item_id if not set to ensure context is passed for older rooms
            if (room.market_item_id !== item.id) {
                await supabase.from('chat_rooms').update({ market_item_id: item.id }).eq('id', room.id);
            }
        } else {
            const { data: newRoom, error: createError } = await supabase
                .from('chat_rooms')
                .insert({
                    participant_one_id: currentUser.id,
                    participant_two_id: item.seller_id,
                    market_item_id: item.id,
                    category: 'COMMUNITY'
                })
                .select()
                .single();
            
            if (createError) {
                // Potential unique constraint hit, try fetching again
                const { data: retryRoom } = await supabase
                    .from('chat_rooms')
                    .select('id')
                    .eq('market_item_id', item.id)
                    .or(`participant_one_id.eq.${currentUser.id},participant_two_id.eq.${currentUser.id}`)
                    .maybeSingle();
                
                if (retryRoom) {
                    room = retryRoom;
                } else {
                    console.error('Error creating room:', createError);
                    return;
                }
            } else {
                room = newRoom;
            }
        }

        if (room) {
            // Check if there's an initial message in this room
            const { data: existingMessages } = await supabase
                .from('messages')
                .select('id')
                .eq('conversation_id', room.id)
                .limit(1);

            if (!existingMessages || existingMessages.length === 0) {
                // Send initial context message
                await supabase.from('messages').insert({
                    sender_id: currentUser.id,
                    receiver_id: item.seller_id,
                    conversation_id: room.id,
                    content: `Hi! I'm interested in your ${item.title} listed in ${item.location}. Is it still available?`
                });
            }

            // Navigate to the chat with conversationId and context params
            router.push(`/messages/${item.seller_id}?conversationId=${room.id}&item_id=${item.id}&item_title=${encodeURIComponent(item.title)}&item_price=${item.price}`);
        }
    };

    const handleStatusUpdate = async (itemId: string, newStatus: string) => {
        const { error } = await supabase
            .from('market_listings')
            .update({ status: newStatus })
            .eq('id', itemId);
            
        if (!error) {
            setItems(items.map(it => it.id === itemId ? { ...it, status: newStatus as any } : it));
        }
    };

    const confirmDelete = async () => {
        if (deleteConfirmationText !== 'DELETE' || !itemToDelete) return;
        setIsDeleting(true);
        const { data, error } = await supabase
            .from('market_listings')
            .update({ status: 'deleted' })
            .eq('id', itemToDelete)
            .select();
        
        if (error || !data || data.length === 0) {
            console.error("Delete failed (Possible RLS error):", error);
            toast.error(error ? error.message : "Permission Denied: Unable to delete listing.");
            setIsDeleting(false);
            return;
        }

        setItems(prev => prev.filter(item => item.id !== itemToDelete));
        setItemToDelete(null);
        setDeleteConfirmationText("");
        setIsDeleting(false);
        toast.success("Listing permanently deleted.");
    };

    if (!loading && !isVerified) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-gray-50 dark:bg-neutral-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 text-center">
                <Lock size={48} className="text-gray-300 dark:text-gray-600 mb-6 mx-auto" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Market Locked</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-sm">Upload your Student ID in the Profile section to unlock the Campus Market.</p>
                <button 
                    onClick={() => router.push('/dashboard/student?tab=profile')}
                    className="bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:scale-105 transition-all shadow-xl"
                >
                    Go to Profile →
                </button>
            </div>
        );
    }

    const visibleItems = items.filter(item => {
        if (item.title === 'SONY PS4') return false;
        if (filter === 'My Listings') return true;
        return item.status === 'active' && item.quantity > 0;
    });

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-[#BEF264]/10 rounded-xl">
                            <ShoppingCart className="w-6 h-6 text-[#BEF264]" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Campus Market</h2>
                    </div>
                    <p className="text-gray-500 font-medium text-sm ml-1">Buy and sell student essentials securely with HOSTELPULSE Escrow.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#BEF264] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search market..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 pl-11 pr-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264]/20 focus:border-[#BEF264] transition-all w-full md:w-64 font-medium text-sm"
                        />
                    </div>

                    <button 
                        onClick={() => {
                            if (!currentUser) return router.push('/join');
                            if (!isVerified) {
                                alert("Verification Required: To sell on Campus Market, please complete your profile verification first.");
                                router.push('/dashboard/student?tab=profile');
                                return;
                            }
                            setShowPostModal(true);
                        }}
                        className="bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#BEF264]/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Sell Something
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2
                            ${filter === cat 
                                ? 'bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/20' 
                                : 'bg-white dark:bg-neutral-900 text-gray-400 hover:text-black dark:hover:text-white border border-neutral-100 dark:border-white/5'
                            }
                        `}
                    >
                        {cat === 'My Listings' && <Package className="w-3.5 h-3.5" />}
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse text-center py-20">
                    <p className="col-span-full font-black text-gray-400 uppercase tracking-widest text-xs">Loading marketplace items...</p>
                </div>
            ) : visibleItems.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem] p-20 text-center">
                    <Tag className="w-12 h-12 text-gray-200 dark:text-neutral-800 mx-auto mb-4" />
                    <p className="font-black text-gray-400 uppercase tracking-tight text-lg mb-1">No items found</p>
                    <p className="text-gray-400 text-sm">Be the first to list something in this category!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {visibleItems.map((item) => {
                        const isOwner = currentUser?.id === item.seller_id;
                        return (
                            <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                                {/* Image area */}
                                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-neutral-800">
                                    <Image 
                                        src={item.image_url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop`} 
                                        alt={item.title}
                                        fill
                                        className={`object-cover group-hover:scale-110 transition-transform duration-500 ${item.status === 'sold' ? 'grayscale opacity-50' : ''}`}
                                    />
                                    
                                    {item.status === 'sold' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                                            <div className="bg-gray-500 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl rotate-[-5deg]">
                                                Unavailable
                                            </div>
                                        </div>
                                    )}

                                    {isOwner && (
                                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                            {item.status === 'active' && !escrowStatuses[item.id] && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, 'sold'); }}
                                                    className="bg-gray-200 text-black p-2 rounded-xl text-[8px] font-black uppercase tracking-tight shadow-lg hover:scale-105 transition-all"
                                                >
                                                    Mark as Unavailable
                                                </button>
                                            )}
                                            {escrowStatuses[item.id] === 'Locked' && (
                                                <button 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        const tid = (window as any)._transactionIds?.[item.id];
                                                        if (tid) setQrTransaction({ id: tid, title: item.title });
                                                    }}
                                                    className="bg-[#BEF264] text-black p-2 rounded-xl text-[8px] font-black uppercase tracking-tight shadow-lg shadow-[#BEF264]/20 hover:scale-105 transition-all flex items-center gap-1"
                                                >
                                                    <ShieldCheck size={10} />
                                                    Show QR Code
                                                </button>
                                            )}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }}
                                                className="bg-black/50 backdrop-blur text-white p-2 rounded-xl text-[8px] font-black uppercase tracking-tight shadow-lg hover:bg-red-500 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                                        <p className="text-[#0D9488] font-black text-sm">₦{Number(item.price).toLocaleString()}</p>
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg flex items-center gap-2">
                                        <p className="text-[8px] font-black text-white uppercase tracking-widest">{item.condition}</p>
                                        <span className="text-[8px] font-black text-[#BEF264] uppercase tracking-widest px-1 border-l border-white/20">
                                            {item.quantity} Available
                                        </span>
                                    </div>
                                </div>

                                {/* Info area */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1 group-hover:text-[#BEF264] transition-colors">{item.title}</h3>
                                            {item.seller_profile?.trust_level && (
                                                <Link 
                                                    href={`/profile/${item.seller_id}`}
                                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                                    className="hover:scale-110 transition-transform"
                                                >
                                                    <SellerTrustBadge level={item.seller_profile.trust_level} />
                                                </Link>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <MapPin className="w-3 h-3 text-[#BEF264]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{item.location}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
                                            <ShieldCheck className="w-4 h-4 text-[#BEF264]" />
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Escrow Protected</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link 
                                                href={`/messages/${item.seller_id}?room_id=${item.id}&item_id=${item.id}&item_title=${encodeURIComponent(item.title)}&item_price=${item.price}`}
                                                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-1 border
                                                    ${isOwner 
                                                        ? 'bg-gray-50 dark:bg-white/5 text-gray-300 border-neutral-100 dark:border-white/5 pointer-events-none' 
                                                        : 'bg-white dark:bg-neutral-900 text-black dark:text-white border-neutral-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                                                    }
                                                `}
                                            >
                                                <MessageCircle size={12} />
                                                Contact
                                            </Link>
                                            
                                            {isOwner ? null : (
                                                <button 
                                                    onClick={() => setSelectedItem(item)}
                                                    disabled={item.status === 'sold' || item.quantity <= 0}
                                                    className={`py-3 rounded-xl font-black uppercase tracking-widest text-[8px] hover:scale-[1.02] transition-all shadow-lg active:scale-95 w-full
                                                        ${item.status === 'sold' || item.quantity <= 0
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                            : 'bg-[#BEF264] text-black shadow-[#BEF264]/20 hover:bg-[#a6d456]'
                                                        }
                                                    `}
                                                >
                                                    {item.status === 'sold' || item.quantity <= 0 ? 'Sold Out' : 'Buy with Escrow'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {showPostModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostModal(false)} />
                    <PostMarketItem onClose={() => setShowPostModal(false)} />
                </div>
            )}

            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <EscrowCheckoutModal 
                        item={selectedItem} 
                        onClose={() => setSelectedItem(null)} 
                        onSuccess={(purchasedItemId) => {
                            // Let the real-time subscription or router.refresh handle the DOM update
                            setSelectedItem(null);
                            router.refresh();
                        }}
                    />
                </div>
            )}

            {qrTransaction && (
                <QRGenerator 
                    transactionId={qrTransaction.id}
                    itemTitle={qrTransaction.title}
                    onClose={() => setQrTransaction(null)}
                />
            )}

            {itemToDelete && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
                        setItemToDelete(null);
                        setDeleteConfirmationText("");
                    }} />
                    <div className="bg-white dark:bg-neutral-900 rounded-[2rem] w-full max-w-sm p-8 relative z-10 shadow-2xl border border-red-500/20 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-red-500 uppercase tracking-tight mb-2">Delete Listing</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            This action cannot be undone. This will permanently remove this item from the Campus Market.
                        </p>
                        
                        <input 
                            type="text"
                            placeholder="Type DELETE to confirm"
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-center font-bold text-gray-900 dark:text-white mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => {
                                    setItemToDelete(null);
                                    setDeleteConfirmationText("");
                                }}
                                className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                                className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
