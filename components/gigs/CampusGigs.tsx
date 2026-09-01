"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { postGig, claimGig, completeGig, cancelGig, disputeGig, getCampusGigs } from '@/app/actions/gigs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Briefcase, Clock, CheckCircle, XCircle, AlertTriangle, UserPlus, Tag, Plus, MessageSquare, Flag, Activity, Mail } from 'lucide-react';

export function CampusGigs() {
    const [gigs, setGigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'board' | 'post' | 'activity'>('board');
    const [isPosting, setIsPosting] = useState(false);
    const router = useRouter();

    // Post Gig Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [bounty, setBounty] = useState<number | ''>('');
    const [category, setCategory] = useState('errand');

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const fetchGigs = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);

        const allGigs = await getCampusGigs();
        setGigs(allGigs);
        setLoading(false);
    };

    useEffect(() => {
        fetchGigs();
    }, []);

    const handlePostGig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !bounty || Number(bounty) < 500) {
            toast.error("Please fill all fields. Minimum bounty is ₦500.");
            return;
        }

        setIsPosting(true);
        const res = await postGig({ title, description, bounty: Number(bounty), category });
        
        if (res.error) {
            if (res.error.includes("Insufficient funds")) {
                toast.error(
                    (t) => (
                        <div className="flex flex-col gap-2">
                            <span className="font-bold">Insufficient Balance</span>
                            <span className="text-sm">You need ₦{Number(bounty).toLocaleString()} to post this.</span>
                            <button 
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    router.push('/dashboard/student?tab=wallet');
                                }}
                                className="bg-black dark:bg-white dark:text-black text-white px-3 py-1.5 rounded-lg text-xs mt-1 self-start"
                            >
                                Fund Wallet
                            </button>
                        </div>
                    ),
                    { duration: 6000 }
                );
            } else {
                toast.error(res.error);
            }
        } else {
            toast.success("Gig posted successfully! Funds escrowed.");
            setTitle('');
            setDescription('');
            setBounty('');
            setActiveTab('activity');
            fetchGigs();
        }
        setIsPosting(false);
    };

    const handleAction = async (actionFn: any, id: string, successMsg: string) => {
        const res = await actionFn(id);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(successMsg);
            fetchGigs();
        }
    };

    const openGigs = gigs
        .filter(g => g.status === 'OPEN' && g.student_id !== userId)
        .filter(g => {
            if (filterCategory !== 'all' && g.details?.category !== filterCategory) return false;
            if (searchQuery && !g.service_type.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
        
    const myGigs = gigs.filter(g => g.student_id === userId || g.details?.fulfiller_id === userId);

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-neutral-950/50 p-6 flex flex-col border-r border-neutral-100 dark:border-white/5">
                <h3 className="text-lg font-black uppercase tracking-tight mb-6 text-gray-900 dark:text-white">Campus Gigs</h3>
                <nav className="space-y-2 flex-grow">
                    <button
                        onClick={() => setActiveTab('board')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                            activeTab === 'board' ? 'bg-[#BEF264] text-black shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                        <Briefcase className="w-4 h-4" /> Gig Board
                    </button>
                    <button
                        onClick={() => setActiveTab('post')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                            activeTab === 'post' ? 'bg-[#BEF264] text-black shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                        <Plus className="w-4 h-4" /> Post a Gig
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                            activeTab === 'activity' ? 'bg-[#BEF264] text-black shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                        <Activity className="w-4 h-4" /> My Activity
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-5">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BEF264]"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'board' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50/50 dark:bg-neutral-800 p-6 rounded-2xl border border-blue-100 dark:border-white/5 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Earn Money on Campus</h2>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">Claim tasks posted by other students and earn instant payouts.</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('post')}
                                        className="bg-black dark:bg-[#BEF264] dark:text-black hover:bg-gray-800 dark:hover:bg-[#d9ff96] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4" /> Post a Gig
                                    </button>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <input 
                                        type="text" 
                                        placeholder="Search gigs..." 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#BEF264] dark:focus:border-[#BEF264]"
                                    />
                                    <select 
                                        value={filterCategory}
                                        onChange={e => setFilterCategory(e.target.value)}
                                        className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#BEF264] dark:focus:border-[#BEF264] min-w-[150px]"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="errand">Errand & Delivery</option>
                                        <option value="repair">Maintenance & Repair</option>
                                        <option value="academic">Academic</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {openGigs.length === 0 ? (
                                        <div className="col-span-full py-6 text-center text-gray-400">
                                            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium">No open gigs found.</p>
                                        </div>
                                    ) : (
                                        openGigs.map(gig => (
                                            <div key={gig.id} className="bg-white dark:bg-neutral-950/50 rounded-2xl p-5 border border-gray-100 dark:border-white/5 hover:border-[#BEF264] dark:hover:border-[#BEF264] transition-all shadow-sm group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md mb-2 inline-block">
                                                            {gig.details?.category || 'General'}
                                                        </span>
                                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{gig.service_type}</h3>
                                                    </div>
                                                    <span className="text-lg font-black text-emerald-600 dark:text-[#BEF264] bg-emerald-50 dark:bg-[#BEF264]/10 px-3 py-1 rounded-lg">
                                                        ₦{Number(gig.total_cost).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">{gig.details?.description}</p>
                                                
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                                                            {gig.poster_profile?.avatar_url && <img src={gig.poster_profile.avatar_url} alt="" className="w-full h-full object-cover"/>}
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{gig.poster_profile?.full_name?.split(' ')[0]}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleAction(claimGig, gig.id, "Gig claimed successfully!")}
                                                        className="px-4 py-2 bg-black dark:bg-[#BEF264] dark:text-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-[#d9ff96] transition-colors"
                                                    >
                                                        Claim Gig
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'post' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="bg-gray-50 dark:bg-neutral-950/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 max-w-2xl">
                                    <h3 className="font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Post a New Gig</h3>
                                    <form onSubmit={handlePostGig} className="grid grid-cols-1 gap-4">
                                        <div>
                                            <input 
                                                type="text" 
                                                placeholder="Gig Title (e.g., Fetch water, Fix fan)" 
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                className="w-full bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#BEF264] dark:focus:border-[#BEF264] outline-none font-medium placeholder-gray-400 dark:placeholder-gray-500"
                                                maxLength={50}
                                            />
                                        </div>
                                        <div>
                                            <textarea 
                                                placeholder="Details (Where are you? What exactly needs doing?)" 
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                className="w-full h-32 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#BEF264] dark:focus:border-[#BEF264] outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Bounty (Min 500)" 
                                                        value={bounty}
                                                        onChange={e => setBounty(Number(e.target.value))}
                                                        className="w-full bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#BEF264] dark:focus:border-[#BEF264] outline-none font-black placeholder-gray-400 dark:placeholder-gray-500"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1 pl-1">5% Platform fee deducted from payout.</p>
                                            </div>
                                            <div>
                                                <select 
                                                    value={category}
                                                    onChange={e => setCategory(e.target.value)}
                                                    className="w-full bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#BEF264] dark:focus:border-[#BEF264] outline-none"
                                                >
                                                    <option value="errand">Errand & Delivery</option>
                                                    <option value="repair">Maintenance & Repair</option>
                                                    <option value="academic">Academic (Printouts, etc)</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button 
                                                type="submit"
                                                disabled={isPosting}
                                                className="bg-[#BEF264] hover:bg-[#d9ff96] text-black px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-50"
                                            >
                                                {isPosting ? 'Escrowing...' : 'Post & Escrow'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Your Activity History</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {myGigs.length === 0 ? (
                                            <div className="py-6 text-center text-gray-400 bg-gray-50 dark:bg-neutral-950/50 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="font-medium">No gigs posted or claimed yet.</p>
                                                <button onClick={() => setActiveTab('post')} className="mt-4 text-[#BEF264] font-bold text-sm hover:underline">Post your first gig</button>
                                            </div>
                                        ) : (
                                            myGigs.map(gig => {
                                                const isPoster = gig.student_id === userId;
                                                const contactProfile = isPoster ? gig.fulfiller_profile : gig.poster_profile;
                                                
                                                return (
                                                    <div key={gig.id} className="flex flex-col bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 p-5 rounded-2xl gap-4 shadow-sm">
                                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isPoster ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                                                                        {isPoster ? 'Posted by You' : 'Claimed by You'}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-gray-400">{new Date(gig.created_at).toLocaleDateString()}</span>
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ml-auto sm:ml-2 ${
                                                                        gig.status === 'OPEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                                        gig.status === 'CLAIMED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                                        gig.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                                        gig.status === 'DISPUTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                                                        'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400'
                                                                    }`}>
                                                                        {gig.status}
                                                                    </span>
                                                                </div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{gig.service_type}</h4>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{gig.details?.description}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-3">Bounty: <span className="text-emerald-600 dark:text-[#BEF264] text-base font-black">₦{Number(gig.total_cost).toLocaleString()}</span></p>
                                                            </div>

                                                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                                                <div className="flex flex-wrap gap-2 justify-end">
                                                                    {isPoster && gig.status === 'OPEN' && (
                                                                        <button onClick={() => handleAction(cancelGig, gig.id, 'Gig cancelled, funds refunded.')} className="px-4 py-2 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"><XCircle className="w-4 h-4"/> Cancel Gig</button>
                                                                    )}
                                                                    {isPoster && gig.status === 'CLAIMED' && (
                                                                        <>
                                                                            <button onClick={() => handleAction(completeGig, gig.id, 'Gig marked complete! Fulfiller paid.')} className="px-6 py-2 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Mark Done</button>
                                                                            <button onClick={() => handleAction(disputeGig, gig.id, 'Gig disputed and escalated to Admin.')} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2">
                                                                                <Flag className="w-4 h-4"/> Dispute
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {!isPoster && gig.status === 'CLAIMED' && (
                                                                        <>
                                                                            <span className="text-xs text-amber-600 dark:text-amber-400 italic border border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl flex items-center font-medium">Awaiting Poster Confirmation</span>
                                                                            <button onClick={() => handleAction(disputeGig, gig.id, 'Gig disputed and escalated to Admin.')} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2">
                                                                                <Flag className="w-4 h-4"/> Report Issue
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Contact Info Section if claimed */}
                                                        {gig.status !== 'OPEN' && gig.status !== 'CANCELLED' && contactProfile && (
                                                            <div className="mt-2 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-neutral-950/50 p-3 rounded-xl">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                                                                        {contactProfile.avatar_url ? <img src={contactProfile.avatar_url} className="w-full h-full object-cover" /> : <UserPlus className="w-4 h-4 m-2 text-gray-400" />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">{isPoster ? 'Fulfiller' : 'Poster'}</p>
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{contactProfile.full_name}</p>
                                                                    </div>
                                                                </div>
                                                                {contactProfile.id && (
                                                                    <Link 
                                                                        href={`/messages/${contactProfile.id}`}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 hover:border-[#BEF264] dark:hover:border-[#BEF264] text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-lg text-xs font-bold transition-all"
                                                                    >
                                                                        <MessageSquare className="w-4 h-4" /> Message
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
