"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HostelPulseLogo } from '@/components/ui/HostelPulseLogo';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
    LayoutDashboard, 
    Building2, 
    Calendar, 
    Wallet, 
    Trophy, 
    MessageCircle, 
    LogOut, 
    X,
    User,
    ShieldCheck,
    ChevronRight,
    BarChart3,
    LifeBuoy
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useHostelPulse } from '@/hooks/useHostelPulse';
import { useMemo } from 'react';

interface AgentSidebarProps {
    isOpen?: boolean;
    isRetracted?: boolean;
    onClose?: () => void;
    onRetractToggle?: () => void;
    userId: string;
}

const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard/agent?tab=overview' },
    { name: 'My Zone', icon: Building2, path: '/dashboard/agent?tab=zone' },
    { name: 'Inspections', icon: Calendar, path: '/dashboard/agent?tab=inspections' },
    { name: 'Wallet', icon: Wallet, path: '/dashboard/agent?tab=wallet' },
    { name: 'Messages', icon: MessageCircle, path: '/dashboard/agent?tab=messages' },
    { name: 'Leaderboard', icon: Trophy, path: '/dashboard/agent?tab=leaderboard' },
    { name: 'Profile', icon: User, path: '/dashboard/agent?tab=profile' },
    { name: 'Analytics', icon: BarChart3, path: '/dashboard/agent?tab=analytics' },
    { name: 'Support', icon: LifeBuoy, path: '/dashboard/agent?tab=support' },
];

export function AgentSidebar({ isOpen, isRetracted, onClose, onRetractToggle, userId }: AgentSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();
    const { pulseColor, pulseLabel } = useHostelPulse(userId);

    const pulseStyles = useMemo(() => ({
        boxShadow: `0 0 12px ${pulseColor}40`,
        borderColor: `${pulseColor}30`
    }), [pulseColor]);
    
    const [agentData, setAgentData] = useState<{ full_name: string; avatar_url: string; rank: string } | null>(null);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        async function fetchData() {
            // Fetch Agent Profile
            const { data: agent } = await supabase
                .from('agent_accounts')
                .select('full_name, avatar_url, rank')
                .eq('id', userId)
                .single();
            if (agent) setAgentData(agent);

            // Fetch Unread Messages Count
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', userId)
                .eq('is_read', false);
            setUnreadMessages(count || 0);
        }
        fetchData();

        // Real-time listener for new messages
        const channel = supabase
            .channel('sidebar-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${userId}`
            }, () => {
                setUnreadMessages(prev => prev + 1);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${userId}`
            }, async () => {
                // Re-fetch count on update (e.g. when messages are marked as read)
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('receiver_id', userId)
                    .eq('is_read', false);
                setUnreadMessages(count || 0);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, supabase]);

    const activeTab = searchParams.get('tab') || 'overview';

    const handleNavigation = (path: string) => {
        router.push(path);
        if (window.innerWidth < 1024) {
            onClose?.();
        }
    };

    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
    };

    const getBadgeColor = (rank: string) => {
        if (rank === 'Gold') return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
        if (rank === 'Silver') return 'text-gray-300 border-gray-400/20 bg-gray-400/5';
        return 'text-orange-400 border-orange-400/20 bg-orange-400/5';
    };

    return (
        <aside className={`
            fixed inset-y-0 left-0 bg-white dark:bg-black border-r border-neutral-200 dark:border-white/5 
            flex flex-col z-[70] transition-all duration-300 shadow-2xl
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isRetracted ? 'w-24' : 'w-72'}
        `}>
            {/* Header */}
            <div className={`p-6 flex items-center ${isRetracted ? 'justify-center' : 'justify-between'}`}>
                {!isRetracted && (
                    <Link href="/" className="flex items-center group" onClick={onClose}>
                        <HostelPulseLogo variant="auto" size={36} />
                    </Link>
                )}
                {isRetracted && (
                    <Link href="/" onClick={onClose}>
                        <HostelPulseLogo variant="icon" size={40} className="animate-pulse" />
                    </Link>
                )}
                <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="absolute -right-4 top-24 z-[80] hidden lg:block">
                <button 
                    onClick={onRetractToggle}
                    className="w-8 h-8 bg-[#BEF264] text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-black"
                >
                    <ChevronRight className={`w-4 h-4 transition-transform duration-500 ${isRetracted ? '' : 'rotate-180'}`} />
                </button>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 px-4 space-y-2 py-6 overflow-y-auto no-scrollbar ${isRetracted ? 'items-center' : ''}`}>
                {navItems.map((item) => {
                    const displayName = item.name === 'My Zone' ? 'My Listings' : item.name;
                    const itemUrl = new URL(item.path, 'http://localhost');
                    const itemTab = itemUrl.searchParams.get('tab');
                    const isActive = activeTab === itemTab;
                    const hasNotification = item.name === 'Messages' && unreadMessages > 0;
                    
                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.path)}
                            title={isRetracted ? displayName : ''}
                            className={`
                                w-full flex items-center transition-all duration-300 rounded-2xl group relative
                                ${isRetracted ? 'justify-center py-4' : 'justify-between px-5 py-3.5'}
                                ${isActive 
                                    ? 'bg-black text-[#BEF264] dark:bg-[#BEF264] dark:text-black shadow-lg shadow-[#BEF264]/10' 
                                    : 'text-neutral-500 hover:text-black dark:text-neutral-500 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                }
                            `}
                        >
                            <div className={`flex items-center gap-4 ${isRetracted ? 'justify-center' : ''}`}>
                                <div className="relative">
                                    <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    {hasNotification && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-black rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    )}
                                </div>
                                {!isRetracted && <span className="text-[10px] font-black uppercase tracking-widest">{displayName}</span>}
                            </div>
                            {!isRetracted && (
                                isActive ? (
                                    <div className="w-1.5 h-1.5 bg-[#BEF264] dark:bg-black rounded-full" />
                                ) : hasNotification ? (
                                    <span className="px-1.5 py-0.5 bg-emerald-500 text-black text-[8px] font-black rounded-md">{unreadMessages}</span>
                                ) : null
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Trust Profile Mini-Card */}
            {agentData && (
                <div className="px-4 mb-4">
                    <div className={`bg-gray-50 dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5 transition-all flex items-center ${isRetracted ? 'justify-center p-3' : 'p-4 gap-4'}`}>
                        <div className={`relative bg-neutral-200 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-transparent hover:border-[#BEF264] transition-all ${isRetracted ? 'w-10 h-10' : 'w-12 h-12'}`}>
                            {agentData.avatar_url && agentData.avatar_url !== 'null' && agentData.avatar_url.trim() !== '' ? (
                                <Image src={agentData.avatar_url} alt="Avatar" fill className="object-cover" />
                            ) : (
                                <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agentData.full_name || 'User')}&backgroundColor=e5e5e5`} alt="Avatar" fill className="object-cover" />
                            )}
                        </div>
                        {!isRetracted && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#BEF264] truncate">{agentData.rank} Rank</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black text-gray-900 dark:text-white truncate">{agentData.full_name}</span>
                                    <ShieldCheck className="w-3 h-3 text-[#BEF264]" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sign Out */}
            <div className="p-4 mt-auto border-t border-neutral-100 dark:border-white/5">
                <button 
                    onClick={handleSignOut}
                    title={isRetracted ? 'Sign Out' : ''}
                    className={`flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group ${isRetracted ? 'justify-center py-4 w-full' : 'w-full gap-4 px-5 py-4'}`}
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    {!isRetracted && <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
