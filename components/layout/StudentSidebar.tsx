'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HostelPulseLogo } from '@/components/ui/HostelPulseLogo';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { 
    Home, 
    Search, 
    Heart, 
    Calendar, 
    Users, 
    ShoppingBag, 
    LogOut, 
    X,
    Map,
    MessageCircle,
    GraduationCap,
    Package,
    ChevronRight,
    User,
    Wallet,
    Wrench,
    HelpCircle
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useSaved } from '@/components/providers/SavedProvider';
import { useHostelPulse } from '@/hooks/useHostelPulse';
import { useMemo } from 'react';

interface StudentSidebarProps {
    isOpen?: boolean;
    isRetracted?: boolean;
    onClose?: () => void;
    onRetractToggle?: () => void;
}

import { Settings } from 'lucide-react';

const mainNavItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard/student' },
    { name: 'Find Hostel', icon: Search, path: '/rent' },
    { name: 'Explore Map', icon: Map, path: '/explore' },
    { name: 'Roommates', icon: Users, path: '/roommates' },
    { name: 'Campus Market', icon: ShoppingBag, path: '/market' },
    { name: 'Campus Gigs', icon: Wrench, path: '/services' },
    { name: 'Messages', icon: MessageCircle, path: '/messages', badge: 'unread' },
];

const bottomNavItems = [
    { name: 'Wallet', icon: Wallet, path: '/dashboard/student?tab=wallet' },
    { name: 'Saved', icon: Heart, path: '/dashboard/student?tab=saved' },
    { name: 'Support', icon: HelpCircle, path: '/dashboard/student?tab=support' },
    { name: 'Settings', icon: Settings, path: '/dashboard/student?tab=profile' },
];

export function StudentSidebar({ isOpen, isRetracted, onClose, onRetractToggle }: StudentSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const supabase = createClient();
    const { savedCount } = useSaved();
    const { pulseColor, pulseLabel } = useHostelPulse(user?.id || null);

    const pulseStyles = useMemo(() => ({
        boxShadow: `0 0 12px ${pulseColor}40`,
        borderColor: `${pulseColor}30`
    }), [pulseColor]);

    const [unreadCount, setUnreadCount] = useState(0);
    const [isLookingForRoommate, setIsLookingForRoommate] = useState(false);
    const [trustData, setTrustData] = useState<{ level: string; sales: number } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSidebarState() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user.id)
                .eq('is_read', false);
            
            setUnreadCount(count || 0);

            const { data: account } = await supabase
                .from('student_accounts')
                .select('looking_for_roommate, avatar_url')
                .eq('id', user.id)
                .single();
            
            setIsLookingForRoommate(account?.looking_for_roommate || false);
            setAvatarUrl(account?.avatar_url || null);

            const { data: profile } = await supabase
                .from('profiles')
                .select('trust_level, completed_sales, full_name')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                setTrustData({ level: profile.trust_level, sales: profile.completed_sales });
                setFullName(profile.full_name);
            }
        }

        fetchSidebarState();

        const channel = supabase
            .channel('sidebar_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchSidebarState();
            })
            .subscribe();

        return () => { 
            supabase.removeChannel(channel); 
        };
    }, [supabase]);

    const handleNavigation = (path: string) => {
        router.push(path);
        if (window.innerWidth < 1024) {
            onClose?.();
        }
    };

    return (
        <aside className={`
            fixed inset-y-0 left-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-white/10 
            flex flex-col z-[70] transition-all duration-500 shadow-sm
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
                        <HostelPulseLogo variant="icon" size={36} />
                    </Link>
                )}
                <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Retract Toggle (Desktop Only) */}
            <button 
                onClick={onRetractToggle}
                className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-[#BEF264] text-black border border-white dark:border-neutral-900 rounded-full items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
            >
                <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isRetracted ? '' : 'rotate-180'}`} />
            </button>

            {/* Navigation */}
            <nav className={`flex-1 px-4 space-y-1.5 py-4 overflow-y-auto no-scrollbar ${isRetracted ? 'items-center' : ''}`}>
                {mainNavItems.map((item) => {
                    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
                    const isActive = item.path.includes('?') 
                        ? currentUrl === item.path 
                        : pathname === item.path;
                    
                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.path)}
                            title={isRetracted ? item.name : ''}
                            className={`
                                w-full flex items-center transition-all duration-200 rounded-2xl group
                                ${isRetracted ? 'justify-center py-3.5' : 'justify-between px-5 py-3'}
                                ${isActive 
                                    ? 'bg-black text-[#BEF264] dark:bg-[#BEF264] dark:text-black shadow-md' 
                                    : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-[#BEF264] hover:bg-gray-50 dark:hover:bg-white/5'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className="w-5 h-5" />
                                {!isRetracted && <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>}
                            </div>

                            {!isRetracted && item.badge === 'unread' && unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full">{unreadCount}</span>
                            )}
                        </button>
                    );
                })}

                <div className={`my-4 border-t border-neutral-100 dark:border-white/10 ${isRetracted ? 'mx-2' : 'mx-4'}`} />

                {bottomNavItems.map((item) => {
                    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
                    const isActive = item.path.includes('?') 
                        ? currentUrl === item.path 
                        : pathname === item.path;
                    
                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.path)}
                            title={isRetracted ? item.name : ''}
                            className={`
                                w-full flex items-center transition-all duration-200 rounded-2xl group
                                ${isRetracted ? 'justify-center py-3.5' : 'justify-between px-5 py-3'}
                                ${isActive 
                                    ? 'bg-black text-[#BEF264] dark:bg-[#BEF264] dark:text-black shadow-md' 
                                    : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-[#BEF264] hover:bg-gray-50 dark:hover:bg-white/5'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className="w-5 h-5" />
                                {!isRetracted && <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>}
                            </div>
                            {!isRetracted && item.name === 'Saved' && savedCount > 0 && (
                                <span className="bg-[#BEF264] text-black text-[8px] px-2 py-0.5 rounded-full font-black">{savedCount}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Trust Profile Mini-Card */}
            {trustData && (
                <div className="px-3 mb-4">
                    <div className={`bg-gray-50 dark:bg-white/5 rounded-2xl border border-neutral-100 dark:border-white/10 transition-all flex items-center ${isRetracted ? 'justify-center p-2' : 'p-3 gap-3 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                        <div className={`relative bg-neutral-200 dark:bg-white/10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden ${isRetracted ? 'w-10 h-10' : 'w-10 h-10'}`}>
                            {avatarUrl && avatarUrl !== 'null' && avatarUrl.trim() !== '' ? (
                                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                            ) : (
                                <span className="font-black text-black dark:text-white text-lg">
                                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                                </span>
                            )}
                        </div>
                        {!isRetracted && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#BEF264]">{trustData.level}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-bold text-gray-400">{trustData.sales} Shortlets</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sign Out */}
            <div className="p-3 mt-auto border-t border-neutral-100 dark:border-white/10">
                <button 
                    onClick={signOut}
                    title={isRetracted ? 'Sign Out' : ''}
                    className={`flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group ${isRetracted ? 'justify-center py-4 w-full' : 'w-full gap-4 px-5 py-3.5'}`}
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    {!isRetracted && <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
