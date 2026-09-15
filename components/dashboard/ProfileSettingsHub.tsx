"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { User, Shield, Heart, Star, AlertTriangle, LogOut, ChevronRight, CheckCircle2, Lock, FileText, HelpCircle, AlertCircle, Download, CreditCard, Loader2, Smartphone, MapPin } from 'lucide-react';
import { DetailedProfileForm } from './DetailedProfileForm';
import { SavedPropertiesTab } from './SavedPropertiesTab';
import Link from 'next/link';

export function ProfileSettingsHub({ accountData, onUpdate }: { accountData: any, onUpdate: () => void }) {
    const { user, signOut } = useAuth();
    const supabase = createClient();
    const [activeSection, setActiveSection] = useState('menu');
    
    const [reviews, setReviews] = useState<any[]>([]);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    
    const [newPassword, setNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');

    useEffect(() => {
        if (!user) return;
        
        async function fetchTabData() {
            setLoadingData(true);
            if (activeSection === 'My Reviews') {
                const { data } = await supabase
                    .from('provider_reviews')
                    .select('*, properties(title, images)')
                    .eq('reviewer_id', user.id)
                    .order('created_at', { ascending: false });
                setReviews(data || []);
            } else if (activeSection === 'My Disputes') {
                const { data } = await supabase
                    .from('escrow_transactions')
                    .select('*, properties(title, images)')
                    .eq('buyer_id', user.id)
                    .eq('status', 'disputed')
                    .order('created_at', { ascending: false });
                setDisputes(data || []);
            } else if (activeSection === 'My Transactions') {
                const escrowPromise = supabase
                    .from('escrow_transactions')
                    .select(`
                        id, amount, status, created_at, payer_id, payee_id, type,
                        properties!property_id (title),
                        market_listings!listing_id (title)
                    `)
                    .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`);

                const withdrawPromise = supabase
                    .from('withdrawals')
                    .select('*')
                    .eq('user_id', user.id);

                const depositPromise = supabase
                    .from('deposits')
                    .select('*')
                    .eq('user_id', user.id);

                const [escrowRes, withdrawRes, depositRes] = await Promise.all([escrowPromise, withdrawPromise, depositPromise]);

                const escrowFormatted = (escrowRes.data || []).map((t: any) => {
                    const isSale = t.payee_id === user.id;
                    return {
                        id: t.id,
                        amount: isSale ? Number(t.amount) : -Number(t.amount),
                        status: t.status,
                        created_at: t.created_at,
                        title: isSale ? 'Sale' : (t.type === 'INSPECTION_FEE' ? 'Inspection Fee' : (t.properties?.title || t.market_listings?.title || 'Payment'))
                    };
                });

                const withdrawFormatted = (withdrawRes.data || []).map((w: any) => ({
                    id: w.id,
                    amount: -Number(w.amount),
                    status: w.status,
                    created_at: w.created_at,
                    title: 'Withdrawal to Bank'
                }));

                const depositFormatted = (depositRes.data || []).map((d: any) => ({
                    id: d.id,
                    amount: Number(d.amount),
                    status: d.status,
                    created_at: d.created_at,
                    title: 'Wallet Deposit'
                }));

                const combined = [...escrowFormatted, ...withdrawFormatted, ...depositFormatted].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setTransactions(combined);
            }
            setLoadingData(false);
        }
        
        fetchTabData();
    }, [activeSection, user, supabase]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg('');
        if (!newPassword || newPassword.length < 6) {
            setPasswordMsg('Password must be at least 6 characters');
            return;
        }
        
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setPasswordMsg(error.message);
        } else {
            setPasswordMsg('Password updated successfully');
            setNewPassword('');
        }
    };

    const sections = [
        { id: 'Edit Profile', icon: User, label: 'Edit Profile' },
        { id: 'Security', icon: Shield, label: 'Security & Login' },
        { id: 'Saved Hostels', icon: Heart, label: 'Saved Hostels' },
        { id: 'My Reviews', icon: Star, label: 'My Reviews' },
          { id: 'My Transactions', icon: CreditCard, label: 'My Transactions' },
        { id: 'My Disputes', icon: AlertTriangle, label: 'My Disputes' },
        { id: 'Install App', icon: Download, label: 'Install App' },
        { id: 'Explore', icon: MapPin, label: 'Explore Ogbomoso', isLink: true, href: '/explore' }
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10 max-w-6xl mx-auto pb-20">
            
            {/* Settings Sidebar (Hidden on mobile if a section is active) */}
            <div className={`w-full md:w-64 shrink-0 flex-col gap-2 ${activeSection !== 'menu' ? 'hidden md:flex' : 'flex'}`}>
                {/* Profile Summary */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-sm mb-4 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3 overflow-hidden">
                        {accountData?.avatar_url ? (
                            <img src={accountData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 m-5 text-gray-400" />
                        )}
                    </div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase truncate">{accountData?.full_name || 'Student'}</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{accountData?.role || 'Student'}</p>
                </div>
                
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 px-2 hidden md:block">Settings</h2>
                
                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5 p-2 shadow-sm">
                    {sections.map(section => {
                        if (section.isLink) {
                            return (
                                <Link
                                    key={section.id}
                                    href={section.href || '#'}
                                    className="w-full flex items-center justify-between p-3 rounded-2xl transition-all text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <div className="flex items-center gap-3">
                                        <section.icon className="w-5 h-5" />
                                        <span className="font-bold text-sm">{section.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${activeSection === section.id ? 'bg-[#BEF264]/10 text-black dark:text-[#BEF264]' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-[#BEF264]' : ''}`} />
                                    <span className="font-bold text-sm">{section.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </button>
                        );
                    })}
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5 p-2 shadow-sm mt-4">
                    <Link href="/dashboard/student?tab=support" className="w-full flex items-center gap-3 p-3 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
                        <HelpCircle className="w-5 h-5" />
                        <span className="font-bold text-sm">Help & Support</span>
                    </Link>
                    <Link href="/privacy" className="w-full flex items-center gap-3 p-3 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
                        <FileText className="w-5 h-5" />
                        <span className="font-bold text-sm">Privacy Policy</span>
                    </Link>
                    <Link href="/terms" className="w-full flex items-center gap-3 p-3 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
                        <FileText className="w-5 h-5" />
                        <span className="font-bold text-sm">Terms of Service</span>
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                {activeSection !== 'menu' && (
                    <button 
                        onClick={() => setActiveSection('menu')}
                        className="md:hidden flex items-center gap-2 text-gray-500 font-black uppercase tracking-widest text-xs mb-6 hover:text-gray-900 transition-colors"
                    >
                        ← Back
                    </button>
                )}
                {(activeSection === 'Edit Profile' || activeSection === 'menu') && (
                    <div className={`${activeSection === 'menu' ? 'hidden md:block' : 'block'}`}>
                    <div className="animate-in fade-in duration-300">
                        <DetailedProfileForm 
                            account={accountData}
                            userId={user?.id || ''}
                            onUpdate={onUpdate}
                        />
                        </div>
                    </div>
                )}

                {activeSection === 'Security' && (
                    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <Lock className="w-8 h-8 text-[#BEF264]" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Security Settings</h3>
                        </div>
                        
                        <div className="max-w-md space-y-6">
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-white/5 pb-2">Change Password</h4>
                                
                                {passwordMsg && (
                                    <div className={`p-3 rounded-xl text-xs font-bold ${passwordMsg.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {passwordMsg}
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all"
                                    />
                                </div>
                                
                                <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeSection === 'Saved Hostels' && (
                    <div className="animate-in fade-in duration-300">
                        <SavedPropertiesTab />
                    </div>
                )}

                {activeSection === 'My Reviews' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <Star className="w-8 h-8 text-[#BEF264]" />
                            My Reviews
                        </h3>

                        {loadingData ? (
                            <div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#BEF264] border-t-transparent rounded-full animate-spin" /></div>
                        ) : reviews.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl p-10 text-center">
                                <Star className="w-12 h-12 text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
                                <p className="font-black text-gray-400 uppercase tracking-tight">You haven't reviewed any property yet.</p>
                                <p className="text-gray-400 text-sm mt-2 font-medium">After an inspection or move-in, leave a review to help others.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(r => (
                                    <div key={r.id} className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-black text-gray-900 dark:text-white">{r.properties?.title || 'Unknown Property'}</h4>
                                                <div className="flex gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-neutral-700'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">
                                                {new Date(r.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-neutral-400 mt-3">{r.review}</p>
                                        <div className="mt-4 flex gap-2">
                                            {r.is_verified && <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified Stay</span>}
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md flex items-center gap-1">{r.moderation_status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                
                {activeSection === 'My Transactions' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-[#BEF264]" />
                                My Transactions
                            </h3>
                        </div>
                        {loadingData ? (
                            <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                        ) : transactions.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-10 text-center">
                                <p className="text-gray-500 font-medium">No transactions found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {transactions.map((tx: any) => (
                                    <div key={tx.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 p-4 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{tx.title || tx.properties?.title || 'Payment'}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{new Date(tx.created_at).toLocaleDateString()} • {tx.status}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-lg text-gray-900 dark:text-white">₦{tx.amount?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'Install App' && (
                    <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl p-10 text-center animate-in fade-in duration-300">
                        <Download className="w-12 h-12 text-[#BEF264] mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Install HostelPulse</h3>
                        <p className="text-gray-500 font-medium mb-6">Get the native experience by installing our app to your home screen.</p>
                        <button 
                            onClick={() => {
                                alert('To install the app on iOS: Tap Share -> Add to Home Screen. On Android: Tap menu -> Install App.');
                            }}
                            className="bg-[#BEF264] text-black font-black uppercase tracking-widest text-sm py-4 px-8 rounded-full shadow-lg shadow-[#BEF264]/20 hover:bg-[#a6d456] transition-transform active:scale-95"
                        >
                            Install Now
                        </button>
                    </div>
                )}

                {activeSection === 'My Disputes' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                                My Disputes
                            </h3>
                            <button className="bg-black dark:bg-[#BEF264] text-white dark:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                New Report
                            </button>
                        </div>

                        {loadingData ? (
                            <div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
                        ) : disputes.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl p-10 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
                                <p className="font-black text-gray-400 uppercase tracking-tight">No disputes yet.</p>
                                <p className="text-gray-400 text-sm mt-2 font-medium">If you face issues with a booking or agent, report it here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {disputes.map(d => (
                                    <div key={d.id} className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${
                                                    d.status === 'OPEN' ? 'bg-amber-50 text-amber-600' :
                                                    d.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' :
                                                    d.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' :
                                                    'bg-blue-50 text-blue-600'
                                                }`}>
                                                    {d.status}
                                                </span>
                                                <h4 className="font-black text-gray-900 dark:text-white">{d.reason}</h4>
                                                {d.properties?.title && <p className="text-xs font-bold text-gray-500 mt-1">Re: {d.properties.title}</p>}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {new Date(d.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-neutral-400 mt-3">{d.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

