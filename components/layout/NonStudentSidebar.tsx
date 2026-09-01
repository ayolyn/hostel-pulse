'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HostelPulseLogo } from '@/components/ui/HostelPulseLogo';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
    LayoutDashboard, 
    Calendar, 
    Heart, 
    Wallet, 
    MessageCircle, 
    LogOut, 
    X,
    User,
    ChevronRight,
    ShieldCheck,
    HelpCircle
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useHostelPulse } from '@/hooks/useHostelPulse';
import { useMemo } from 'react';

interface NonStudentSidebarProps {
    isOpen?: boolean;
    isRetracted?: boolean;
    onClose?: () => void;
    onRetractToggle?: () => void;
}

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, tab: 'overview' },
    { name: 'My Requests', icon: Calendar, tab: 'requests' },
    { name: 'Saved', icon: Heart, tab: 'saved' },
    { name: 'Wallet', icon: Wallet, tab: 'wallet' },
    { name: 'Messages', icon: MessageCircle, tab: 'messages' },
    { name: 'Profile', icon: User, tab: 'profile' },
    { name: 'Support', icon: HelpCircle, tab: 'support' },
];

export function NonStudentSidebar({ isOpen, isRetracted, onClose, onRetractToggle }: NonStudentSidebarProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const supabase = createClient();
    const { pulseColor, pulseLabel } = useHostelPulse(user?.id || null);

    const pulseStyles = useMemo(() => ({
        boxShadow: `0 0 12px ${pulseColor}40`,
        borderColor: `${pulseColor}30`
    }), [pulseColor]);

    const [userData, setUserData] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const activeTab = searchParams.get('tab') || 'overview';

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Try non_student_accounts first, fallback to profiles
            const { data: account } = await supabase
                .from('non_student_accounts')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single();
            
            if (account) {
                setUserData({ full_name: account.full_name, avatar_url: account.avatar_url });
            } else {
                setUserData({ full_name: user.user_metadata?.full_name || 'User', avatar_url: null });
            }

            // Unread count
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user.id)
                .eq('is_read', false);
            setUnreadMessages(count || 0);
        }
        fetchData();

        // Real-time listener
        const channel = supabase
            .channel('nonstudent-sidebar')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
            }, () => {
                fetchData();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    const handleNavigation = (tab: string) => {
        router.push(`/dashboard/non-student?tab=${tab}`);
        if (window.innerWidth < 1024) {
            onClose?.();
        }
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
                        <div className="relative">
                            <HostelPulseLogo variant="auto" size={36} />
                            <div 
                                className="absolute -top-1 -right-2 w-2 h-2 rounded-full"
                                style={{ backgroundColor: pulseColor, boxShadow: `0 0 8px ${pulseColor}`, animation: 'heartbeat 1.2s ease-in-out infinite' }}
                                title={pulseLabel}
                            />
                        </div>
                    </Link>
                )}
                {isRetracted && (
                    <div className="relative">
                        <Link href="/" onClick={onClose}>
                            <HostelPulseLogo variant="icon" size={36} />
                        </Link>
                        <div 
                            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                            style={{ backgroundColor: pulseColor, boxShadow: `0 0 6px ${pulseColor}`, animation: 'heartbeat 1.2s ease-in-out infinite' }}
                        />
                    </div>
                )}
                <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Retract Toggle (Desktop Only) */}
            <button 
                onClick={onRetractToggle}
                className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-[#BEF264] text-black border border-white dark:border-black rounded-full items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
            >
                <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isRetracted ? '' : 'rotate-180'}`} />
            </button>

            {/* Navigation */}
            <nav className={`flex-1 px-4 space-y-2 py-6 overflow-y-auto no-scrollbar ${isRetracted ? 'items-center' : ''}`}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.tab;
                    const hasNotification = item.name === 'Messages' && unreadMessages > 0;
                    
                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.tab)}
                            title={isRetracted ? item.name : ''}
                            className={`
                                w-full flex items-center transition-all duration-300 rounded-2xl group relative
                                ${isRetracted ? 'justify-center py-3' : 'justify-between px-5 py-3.5'}
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
                                {!isRetracted && <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>}
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

            {/* User Profile Mini-Card */}
            {userData && (
                <div className="px-4 mb-4">
                    <div className={`bg-gray-50 dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5 transition-all flex items-center ${isRetracted ? 'justify-center p-3' : 'p-4 gap-4'}`}>
                        <div className={`relative bg-neutral-200 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-transparent hover:border-[#BEF264] transition-all ${isRetracted ? 'w-10 h-10' : 'w-12 h-12'}`}>
                            {userData.avatar_url && userData.avatar_url !== 'null' && userData.avatar_url.trim() !== '' ? (
                                <Image src={userData.avatar_url} alt="Avatar" fill className="object-cover" />
                            ) : (
                                <span className="font-black text-black dark:text-white text-lg">
                                    {userData.full_name ? userData.full_name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            )}
                        </div>
                        {!isRetracted && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#BEF264]">Buyer / Renter</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black text-gray-900 dark:text-white truncate">{userData.full_name}</span>
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
                    onClick={signOut}
                    title={isRetracted ? 'Sign Out' : ''}
                    className={`flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group ${isRetracted ? 'justify-center py-3 w-full' : 'w-full gap-4 px-5 py-3'}`}
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    {!isRetracted && <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
