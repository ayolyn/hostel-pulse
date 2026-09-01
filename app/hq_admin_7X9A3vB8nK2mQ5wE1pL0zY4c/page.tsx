"use client";
export const runtime = 'edge';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getAdminMetrics, getPendingAccounts, approveAccount, rejectAccount, getDisputedTransactions, getAuditChat, resolveDispute, getAnalyticsData, getAllUsers, revokeVerification, suspendAccount, banDevice, getPendingEscrows, forceReleaseEscrow, forceRefundEscrow, getSupportTickets, updateTicketStatus, broadcastSystemAlert } from './actions';
import { fireGlobalBroadcast } from '@/app/actions/admin';
import { resolveEscrowDispute } from '@/app/actions/escrow';
import { getAdminServices } from '@/app/actions/services';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { AdminChatWindow } from './AdminChatWindow';
import { ServicesManager } from '@/components/admin/ServicesManager';
import {
    CheckCircle,
    AlertTriangle,
    Play,
    Eye,
    ShieldCheck,
    Users,
    MessageSquare,
    Zap,
    Lock,
    RefreshCcw,
    MapPin,
    Search,
    ChevronRight,
    Bell,
    Wallet,
    HeadphonesIcon,
    Megaphone,
    XCircle,
    UserX,
    ShieldOff
} from 'lucide-react';

const AccountApprovalCard = ({ account, onApprove, onReject }: { account: any, onApprove: () => void, onReject: () => void }) => {
    const isLandlord = account._tableName === 'landlord_accounts';

    return (
        <div className="bg-[#1e293b] rounded-[2.5rem] p-6 border border-white/5 hover:border-[#BEF264]/30 transition-all group">
            <div className="flex flex-col md:flex-row gap-6">
                {/* User Avatar Placeholder */}
                <div className="relative w-24 h-24 bg-black rounded-[2rem] overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-[#BEF264]/50 transition-colors shrink-0">
                    {account.logo_url || account.selfie_url ? (
                        <img src={account.logo_url || account.selfie_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <Users className="text-[#BEF264] opacity-50" size={32} />
                    )}
                </div>

                {/* Account Brief */}
                <div className="flex-grow flex flex-col justify-between py-2">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${account._tableName === 'student_accounts' ? 'bg-blue-500/20 text-blue-400' :
                                        account._tableName === 'agent_accounts' ? 'bg-purple-500/20 text-purple-400' :
                                            account._tableName === 'landlord_accounts' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                        {account._tableName ? account._tableName.split('_')[0] : 'account'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-white tracking-tight leading-none">
                                    {account.full_name || (account.first_name ? `${account.first_name} ${account.last_name || ''}` : 'Unknown Name')}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                                    {account.phone || account.phone_number || 'No Phone provided'} • {account.contact_email || account.email || 'No Email'}
                                </p>
                            </div>
                            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-yellow-500/20">
                                Pending
                            </span>
                        </div>
                    </div>

                    {/* Extended Details for All Profiles / Landlords */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                        {isLandlord && (
                            <>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Business Detail</p>
                                    <p className="text-sm font-bold text-white">{account.business_name || 'N/A'}</p>
                                    <p className="text-xs text-gray-400 mt-1">{account.business_category} • {account.office_state}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Address</p>
                                    <p className="text-sm font-medium text-white">{account.office_address || 'No address'}</p>
                                </div>
                            </>
                        )}
                        {!isLandlord && account.department && (
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Student Details</p>
                                <p className="text-sm font-bold text-white">{account.department}</p>
                                <p className="text-xs text-gray-400 mt-1">Level {account.level}</p>
                            </div>
                        )}
                        
                        {/* Documents */}
                        <div className="col-span-1 sm:col-span-2 mt-2 pt-4 border-t border-white/5">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Compliance Docs</p>
                            <div className="flex flex-wrap gap-2">
                                {account.student_id_url && (
                                    <a href={account.student_id_url} target="_blank" className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">Student ID Card</a>
                                )}
                                {account.govt_id_url && (
                                    <a href={account.govt_id_url} target="_blank" className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">Govt ID</a>
                                )}
                                {account.selfie_url && (
                                    <a href={account.selfie_url} target="_blank" className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors">Selfie</a>
                                )}
                                {account.cac_document_url && (
                                    <a href={account.cac_document_url} target="_blank" className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">CAC Document</a>
                                )}
                                {(!account.govt_id_url && !account.selfie_url && !account.student_id_url) && (
                                    <span className="text-xs text-red-500 font-bold uppercase tracking-widest mt-1">No Documents Provided</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={onApprove}
                            className="flex-grow bg-[#BEF264] hover:bg-[#d9ff96] text-black text-[10px] font-black py-3 rounded-2xl transition-all uppercase tracking-widest shadow-lg shadow-[#BEF264]/10 active:scale-95"
                        >
                            Approve Account
                        </button>
                        <button
                            onClick={onReject}
                            className="flex-grow bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] font-black py-3 rounded-2xl transition-all uppercase tracking-widest active:scale-95"
                        >
                            Reject & Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminHqPortal = () => {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'analytics';
    const [pendingAccounts, setPendingAccounts] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [allUsersData, setAllUsersData] = useState<any[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [pendingEscrows, setPendingEscrows] = useState<any[]>([]);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);
    const [activeTicket, setActiveTicket] = useState<any>(null);
    const [disputes, setDisputes] = useState<any[]>([]);

    const [adminServices, setAdminServices] = useState<any[]>([]);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState<'info'|'warning'|'success'|'error'>('info');
    const [broadcastTargetRole, setBroadcastTargetRole] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            const pending = await getPendingAccounts();
            const analyticsData = await getAnalyticsData();
            const users = await getAllUsers();
            const escrows = await getPendingEscrows();
            
            // ADMIN TICKET FETCH OVERHAUL
            const db = createClient();
            const { data: ticketsData, error: ticketsError } = await db
                .from('support_tickets')
                .select('id, subject, status, created_at, profiles!inner(full_name, avatar_url)')
                .order('created_at', { ascending: false });
                
            console.log('--- ADMIN TICKET FETCH ---', { data: ticketsData, error: ticketsError });
            if (ticketsError) {
                alert(`Ticket Fetch Error: ${ticketsError.message}`);
            }

            const disps = await getDisputedTransactions();
            const aServices = await getAdminServices();
            
            setPendingAccounts(pending || []);
            setAnalytics(analyticsData);
            setAllUsersData(users || []);
            setPendingEscrows(escrows || []);
            setSupportTickets(ticketsData || []);
            setDisputes(disps || []);
            setAdminServices(aServices || []);
            setIsLoading(false);
        };
        fetchInitialData();
    }, []);

    const handleBroadcast = async () => {
        if (!broadcastMessage) return;
        try {
            await broadcastSystemAlert(broadcastMessage, broadcastType, broadcastTargetRole);
            await fireGlobalBroadcast(broadcastTargetRole, broadcastType, broadcastMessage);
            alert('System Alert Broadcasted Successfully!');
            setBroadcastMessage('');
        } catch (error: any) {
            console.error('--- BROADCAST SUBMISSION FAILED ---', error);
            alert(`Error: ${error.message || 'Failed to broadcast'}`);
        }
    };

    return (
        <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden w-full">
             <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
                 {/* Topbar */}
                 <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-10">
                     <h2 className="text-xl font-black uppercase tracking-widest">
                         {activeTab}
                     </h2>
                 </header>

                 <div className="p-5 max-w-7xl mx-auto w-full">

                {activeTab === 'verifications' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#BEF264]">Account Queue</h2>
                            <span className="bg-[#BEF264]/10 text-[#BEF264] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#BEF264]/20 animate-pulse">
                                {pendingAccounts.length} Awaiting
                            </span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {pendingAccounts.map((acc: any) => (
                                <AccountApprovalCard 
                                    key={acc.id} 
                                    account={acc} 
                                    onApprove={async () => {
                                        if (confirm("Approve?")) {
                                            await approveAccount(acc.id, acc._tableName);
                                            const pending = await getPendingAccounts();
                                            setPendingAccounts(pending || []);
                                        }
                                    }}
                                    onReject={async () => {
                                        if (confirm("Reject?")) {
                                            await rejectAccount(acc.id, acc._tableName);
                                            const pending = await getPendingAccounts();
                                            setPendingAccounts(pending || []);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'disputes' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-red-500">Active Disputes</h2>
                            <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                {disputes.length} Disputes
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                            {disputes.map((d: any) => (
                                <div key={d.id} className="bg-[#1e293b] rounded-[2.5rem] p-5 border border-red-500/20 hover:border-red-500/50 transition-all shadow-xl">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                                <h3 className="text-xl font-black text-white">
                                                    {d.type === 'INSPECTION_FEE' ? `Inspection Fee Dispute - ${d.properties?.title || 'Unknown Property'}` : (d.market_listings?.title || 'Item')}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Escrow ID: {d.id}</p>
                                        </div>
                                        <span className="text-2xl font-black text-white">₦{Number(d.amount).toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 mb-6">
                                        <span className="text-[10px] text-red-400 font-black uppercase tracking-widest block mb-1">Dispute Reason</span>
                                        <p className="text-sm text-gray-300 italic">"{d.dispute_reason || 'No reason provided'}"</p>
                                        <div className="flex gap-4 mt-3">
                                            <p className="text-xs text-gray-500 font-medium">Payer: <span className="text-gray-300 font-mono">{d.payer_id}</span></p>
                                            <p className="text-xs text-gray-500 font-medium">Payee: <span className="text-gray-300 font-mono">{d.payee_id}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link 
                                            href={`/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/disputes/${d.id}`}
                                            className="flex-1 text-center px-4 py-3 bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-all"
                                        >
                                            View Case Room
                                        </Link>
                                        <button 
                                            onClick={async () => {
                                                if (confirm("Refund Buyer? This will return the funds to their wallet and close the transaction.")) {
                                                    const res = await resolveEscrowDispute(d.id, 'REFUND_BUYER');
                                                    if (res.error) alert(res.error);
                                                    else setDisputes(prev => prev.filter(x => x.id !== d.id));
                                                }
                                            }}
                                            className="flex-1 text-center px-4 py-3 bg-blue-500/20 text-blue-400 font-black uppercase tracking-widest text-[10px] rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                                        >
                                            Refund Buyer
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (confirm("Release to Seller? This will send the funds to the seller/landlord and close the transaction.")) {
                                                    const res = await resolveEscrowDispute(d.id, 'RELEASE_SELLER');
                                                    if (res.error) alert(res.error);
                                                    else setDisputes(prev => prev.filter(x => x.id !== d.id));
                                                }
                                            }}
                                            className="flex-1 text-center px-4 py-3 bg-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest text-[10px] rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                                        >
                                            Release to Seller
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}



                {activeTab === 'services' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <ServicesManager services={adminServices} isLoading={isLoading} />
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#BEF264]">Deep Matrix Analytics</h2>
                            <span className="bg-[#BEF264]/10 text-[#BEF264] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#BEF264]/20 animate-pulse">
                                Live Sync Active
                            </span>
                        </div>

                        {!analytics ? (
                            <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 text-center shadow-2xl">
                                <Zap className="w-16 h-16 text-[#BEF264]/50 mx-auto mb-6 animate-pulse" />
                                <h3 className="text-xl font-bold uppercase tracking-widest text-[#BEF264] mb-2">Crunching Data...</h3>
                                <p className="text-gray-400">Pulling historic datasets and aggregations.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Top KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 shadow-xl">
                                        <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Total Volume Processed</h3>
                                        <div className="text-xl sm:text-2xl font-black text-white">₦{analytics.financials.totalVolume.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 shadow-xl">
                                        <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Active Escrow Held</h3>
                                        <div className="text-xl sm:text-2xl font-black text-[#BEF264]">₦{analytics.financials.activeEscrow.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 shadow-xl">
                                        <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Avg. Transaction Value</h3>
                                        <div className="text-xl sm:text-2xl font-black text-blue-400">₦{analytics.financials.avgTransactionValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                                    </div>
                                </div>

                                {/* Charts Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {/* Market Gap Analysis */}
                                    <div className="bg-[#1e293b] rounded-[2.5rem] p-5 border border-white/5 shadow-2xl">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Market Gap Analysis</h3>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.marketGap}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                    <XAxis dataKey="category" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${val/1000}k`} />
                                                    <RechartsTooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '1rem'}} />
                                                    <Legend wrapperStyle={{fontSize: '10px'}} />
                                                    <Bar dataKey="budget" name="Avg Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="price" name="Avg Price Listed" fill="#BEF264" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Conversion Funnel */}
                                    <div className="bg-[#1e293b] rounded-[2.5rem] p-5 border border-white/5 shadow-2xl">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Conversion Funnel</h3>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={analytics.funnel}>
                                                    <defs>
                                                        <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                    <XAxis dataKey="step" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                                                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '1rem'}} />
                                                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorFunnel)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* User Engagement (DAU) */}
                                    <div className="bg-[#1e293b] rounded-[2.5rem] p-5 border border-white/5 shadow-2xl lg:col-span-2">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">User Engagement (DAU)</h3>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={analytics.userEngagement}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                    <XAxis dataKey="date" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                                                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '1rem'}} />
                                                    <Legend wrapperStyle={{fontSize: '10px'}} />
                                                    <Line type="monotone" dataKey="Student" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                                                    <Line type="monotone" dataKey="Landlord" stroke="#BEF264" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                                                    <Line type="monotone" dataKey="Agent" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ======================================= */}
                {/* USER MANAGEMENT MODULE */}
                {/* ======================================= */}
                {activeTab === 'users' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <Users className="w-8 h-8 text-blue-500" /> User Management
                                </h2>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Action Center</p>
                            </div>
                            <div className="relative w-full md:w-auto">
                                <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    placeholder="Search Name or Email..." 
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-[#1e293b] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-300">
                                    <thead className="text-[10px] text-gray-500 uppercase tracking-widest bg-black/20 border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-3 font-black">User Details</th>
                                            <th className="px-6 py-3 font-black">Role / Account</th>
                                            <th className="px-6 py-3 font-black">Status</th>
                                            <th className="px-6 py-3 font-black">Admin Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {allUsersData.filter(u => 
                                            (u.full_name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                                            (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase())
                                        ).map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="font-bold text-white">{user.full_name || user.first_name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{user.email || user.contact_email}</div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        user._tableName === 'student_accounts' ? 'bg-blue-500/20 text-blue-400' :
                                                        user._tableName === 'landlord_accounts' ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                        {user._tableName.split('_')[0]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
                                                        user.status === 'suspended' ? 'text-red-400' : 
                                                        user.status === 'banned' ? 'text-red-600' : 
                                                        'text-emerald-400'
                                                    }`}>
                                                        {user.status === 'suspended' || user.status === 'banned' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                        {user.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex gap-2">
                                                        {user.is_verified && (
                                                            <button 
                                                                onClick={async () => {
                                                                    if (confirm("Revoke verification?")) {
                                                                        await revokeVerification(user.id, user._tableName);
                                                                        const updated = await getAllUsers();
                                                                        setAllUsersData(updated);
                                                                    }
                                                                }}
                                                                className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20" title="Revoke Verification">
                                                                <ShieldOff className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={async () => {
                                                                if (confirm("Suspend this account immediately?")) {
                                                                    await suspendAccount(user.id, user._tableName);
                                                                    const updated = await getAllUsers();
                                                                    setAllUsersData(updated);
                                                                }
                                                            }}
                                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20" title="Suspend Account">
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                if (confirm("HARD BAN this user?")) {
                                                                    await banDevice(user.id, user._tableName);
                                                                    const updated = await getAllUsers();
                                                                    setAllUsersData(updated);
                                                                }
                                                            }}
                                                            className="px-3 py-2 bg-red-900/40 text-red-400 border border-red-900 rounded-lg hover:bg-red-900/60 text-[10px] font-black uppercase tracking-widest" title="Ban Device/IP">
                                                            Ban
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allUsersData.length === 0 && (
                                    <div className="p-6 text-center text-gray-500 font-bold uppercase tracking-widest">No users found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================================= */}
                {/* ESCROW CONTROL MODULE */}
                {/* ======================================= */}
                {activeTab === 'escrow' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Wallet className="w-8 h-8 text-orange-500" /> Escrow Ledger
                            </h2>
                            <span className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                {pendingEscrows.length} Active Holds
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {pendingEscrows.length === 0 ? (
                                <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 text-center shadow-2xl">
                                    <Wallet className="w-16 h-16 text-orange-500/50 mx-auto mb-6 opacity-50" />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-orange-500 mb-2">Ledger Empty</h3>
                                    <p className="text-gray-400">No active escrow holds at the moment.</p>
                                </div>
                            ) : pendingEscrows.map((escrow) => (
                                <div key={escrow.id} className="bg-[#1e293b] rounded-[2.5rem] p-5 border border-orange-500/20 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-orange-500/30">
                                                Status: {escrow.status}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono">{escrow.id}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white">{escrow.market_listings?.title || 'Unknown Item'}</h3>
                                        <p className="text-2xl font-black text-[#BEF264] mt-2">₦{Number(escrow.amount).toLocaleString()}</p>
                                    </div>

                                    <div className="flex gap-3 w-full lg:w-auto">
                                        <button 
                                            onClick={async () => {
                                                if (confirm("Force Refund back to Buyer?")) {
                                                    await forceRefundEscrow(escrow.id);
                                                    const updated = await getPendingEscrows();
                                                    setPendingEscrows(updated || []);
                                                }
                                            }}
                                            className="flex-1 lg:flex-none bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black py-3 px-6 rounded-xl uppercase tracking-widest transition-colors"
                                        >
                                            Force Refund
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (confirm("Force Release to Seller?")) {
                                                    await forceReleaseEscrow(escrow.id);
                                                    const updated = await getPendingEscrows();
                                                    setPendingEscrows(updated || []);
                                                }
                                            }}
                                            className="flex-1 lg:flex-none bg-[#BEF264]/10 hover:bg-[#BEF264]/20 text-[#BEF264] border border-[#BEF264]/30 text-[10px] font-black py-3 px-6 rounded-xl uppercase tracking-widest transition-colors"
                                        >
                                            Force Release
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======================================= */}
                {/* LIVE SUPPORT MODULE */}
                {/* ======================================= */}
                {activeTab === 'support' && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-4 mb-8">
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <HeadphonesIcon className="w-8 h-8 text-purple-500" /> Support Desk
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
                            {/* Tickets List */}
                            <div className="col-span-1 bg-[#1e293b] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-white/5">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Active Tickets</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {supportTickets.length === 0 ? (
                                        <p className="text-center text-gray-500 text-sm mt-10 uppercase font-bold tracking-widest">No Active Tickets</p>
                                    ) : supportTickets.map(ticket => (
                                        <button 
                                            key={ticket.id}
                                            onClick={() => setActiveTicket(ticket)}
                                            className={`w-full text-left p-5 rounded-2xl border transition-all ${
                                                activeTicket?.id === ticket.id 
                                                ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10' 
                                                : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                                                    ticket.status === 'Open' ? 'bg-blue-500/20 text-blue-400' :
                                                    ticket.status === 'Pending Admin' ? 'bg-orange-500/20 text-orange-400 animate-pulse border border-orange-500/50' :
                                                    ticket.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-bold">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="font-bold text-white text-sm truncate">{ticket.subject}</p>
                                            <p className="text-xs text-gray-400 mt-1 truncate">{ticket.profiles?.full_name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chat View */}
                            <div className="col-span-1 lg:col-span-2 bg-[#1e293b] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
                                {activeTicket ? (
                                    <>
                                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                                            <div>
                                                <h3 className="font-black text-white text-lg">{activeTicket.subject}</h3>
                                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">User: {activeTicket.profiles?.full_name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <select 
                                                    value={activeTicket.status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value as any;
                                                        await updateTicketStatus(activeTicket.id, newStatus);
                                                        setActiveTicket({ ...activeTicket, status: newStatus });
                                                        setSupportTickets(supportTickets.map(t => t.id === activeTicket.id ? { ...t, status: newStatus } : t));
                                                    }}
                                                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-300 focus:border-purple-500/50 outline-none"
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Pending Admin">Pending Admin</option>
                                                    <option value="Resolved">Resolved</option>
                                                </select>
                                                {activeTicket.status !== 'Resolved' && (
                                                    <button
                                                        onClick={async () => {
                                                            const newStatus = 'Resolved';
                                                            await updateTicketStatus(activeTicket.id, newStatus);
                                                            setActiveTicket({ ...activeTicket, status: newStatus });
                                                            setSupportTickets(supportTickets.map(t => t.id === activeTicket.id ? { ...t, status: newStatus } : t));
                                                            
                                                            const db = createClient();
                                                            await db.from('ticket_messages').insert({
                                                                ticket_id: activeTicket.id,
                                                                sender_role: 'system',
                                                                content: 'This ticket has been resolved by an Admin.'
                                                            });
                                                        }}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Mark as Resolved
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <AdminChatWindow ticketId={activeTicket.id} />
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                        <HeadphonesIcon className="w-20 h-20 text-white/5 mb-6" />
                                        <p className="text-gray-500 font-bold uppercase tracking-widest">Select a ticket to begin resolution</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================================= */}
                {/* SYSTEM ALERTS MODULE */}
                {/* ======================================= */}
                {activeTab === 'alerts' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-4 mb-8">
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Megaphone className="w-8 h-8 text-[#BEF264]" /> System Broadcasts
                            </h2>
                        </div>
                        
                        <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 shadow-2xl max-w-2xl">
                            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">New Announcement</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2">Target Audience</label>
                                    <select 
                                        value={broadcastTargetRole}
                                        onChange={(e) => setBroadcastTargetRole(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#BEF264]/50 outline-none"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="student">Students Only</option>
                                        <option value="landlord">Landlords Only</option>
                                        <option value="agent">Agents Only</option>
                                    </select>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Message Content</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setBroadcastMessage(prev => prev + '{first_name}')} className="text-[9px] font-bold bg-[#BEF264]/10 text-[#BEF264] px-2 py-1 rounded hover:bg-[#BEF264]/20 transition-colors">+ First Name</button>
                                            <button onClick={() => setBroadcastMessage(prev => prev + '{role}')} className="text-[9px] font-bold bg-[#BEF264]/10 text-[#BEF264] px-2 py-1 rounded hover:bg-[#BEF264]/20 transition-colors">+ Role</button>
                                            <button onClick={() => setBroadcastMessage(prev => prev + '{email}')} className="text-[9px] font-bold bg-[#BEF264]/10 text-[#BEF264] px-2 py-1 rounded hover:bg-[#BEF264]/20 transition-colors">+ Email</button>
                                        </div>
                                    </div>
                                    <textarea 
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        placeholder="Type broadcast message... (Supports {first_name} variables)"
                                        className="w-full h-32 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#BEF264]/50 outline-none resize-none"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2">Alert Type</label>
                                    <div className="flex gap-4">
                                        {['info', 'warning', 'success', 'error'].map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => setBroadcastType(t as any)}
                                                className={`flex-1 py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                                                    broadcastType === t ? 'bg-[#BEF264]/20 border-[#BEF264]/50 text-[#BEF264]' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={handleBroadcast}
                                    className="w-full bg-[#BEF264] hover:bg-[#d9ff96] text-black font-black uppercase tracking-widest py-3 rounded-2xl transition-transform active:scale-95 mt-4"
                                >
                                    Fire Broadcast 📢
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                 </div>
             </main>
        </div>
    );
};

export default function AdminHqPortalWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A] p-6 text-white">Loading Admin Portal...</div>}>
            <AdminHqPortal />
        </Suspense>
    );
}
