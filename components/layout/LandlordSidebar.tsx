'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { HostelPulseLogo } from '@/components/ui/HostelPulseLogo';
import { 
    Home, 
    ShieldCheck, 
    UploadCloud, 
    Calendar, 
    MessageSquare, 
    Wallet,
    LogOut,
    X,
    ChevronRight,
    BarChart3,
    HelpCircle
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useHostelPulse } from '@/hooks/useHostelPulse';
import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface LandlordSidebarProps {
    isApproved: boolean;
    isOpen?: boolean;
    isRetracted?: boolean;
    onClose?: () => void;
    onRetractToggle?: () => void;
}

const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, href: '/dashboard/landlord?tab=overview', requiresAuth: false },
    { id: 'listings', label: 'My Listings', icon: UploadCloud, href: '/dashboard/landlord?tab=listings', requiresAuth: true },
    { id: 'inspections', label: 'Inspections', icon: Calendar, href: '/dashboard/landlord?tab=inspections', requiresAuth: true },
    { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/dashboard/landlord?tab=wallet', requiresAuth: true },
    { id: 'profile', label: 'Profile', icon: ShieldCheck, href: '/dashboard/landlord?tab=profile', requiresAuth: false },
    { id: 'messages', label: 'My Messages', icon: MessageSquare, href: '/dashboard/landlord?tab=messages', requiresAuth: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/landlord?tab=analytics', requiresAuth: true },
    { id: 'support', label: 'Support', icon: HelpCircle, href: '/dashboard/landlord?tab=support', requiresAuth: true },
];

export function LandlordSidebar({ isApproved, isOpen, isRetracted, onClose, onRetractToggle }: LandlordSidebarProps) {
    const searchParams = useSearchParams();
    const { user, signOut } = useAuth();
    const { pulseColor, pulseLabel } = useHostelPulse(user?.id || null);
    const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
            if (data) setProfile(data);
        };
        fetchProfile();
    }, [user]);

    const pulseStyles = useMemo(() => ({
        boxShadow: `0 0 12px ${pulseColor}40`,
        borderColor: `${pulseColor}30`
    }), [pulseColor]);
    
    // Default to 'overview' if no tab is selected
    const activeTab = searchParams.get('tab') || 'overview';

    return (
        <aside className={`
            fixed inset-y-0 left-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-white/10 
            flex flex-col z-[70] transition-all duration-300 shadow-sm
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

            <div className={`flex-1 overflow-y-auto py-8 ${isRetracted ? 'items-center' : ''}`}>
                <nav className={`space-y-2 px-4 ${isRetracted ? 'flex flex-col items-center' : ''}`}>
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        onClose?.();
                                    }
                                }}
                                title={isRetracted ? item.label : ''}
                                className={`flex items-center transition-all duration-200 rounded-2xl group
                                    ${isRetracted ? 'justify-center p-3.5 w-full' : 'gap-3 px-5 py-3.5 text-[0.85rem] uppercase tracking-widest font-black'}
                                    ${isActive 
                                        ? 'bg-black text-[#BEF264] dark:bg-[#BEF264] dark:text-black shadow-md' 
                                        : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
                                {!isRetracted && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            
            {/* User Profile Mini-Card */}
            {profile && (
                <div className="px-4 mb-4">
                    <div className={`bg-gray-50 dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5 transition-all flex items-center ${isRetracted ? 'justify-center p-3' : 'p-4 gap-4'}`}>
                        <div className={`relative bg-neutral-200 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-transparent hover:border-[#BEF264] transition-all ${isRetracted ? 'w-10 h-10' : 'w-12 h-12'}`}>
                            {profile.avatar_url && profile.avatar_url !== 'null' && profile.avatar_url.trim() !== '' ? (
                                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                            ) : (
                                <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.full_name || 'User')}&backgroundColor=e5e5e5`} alt="Avatar" fill className="object-cover" />
                            )}
                        </div>
                        {!isRetracted && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#BEF264]">Landlord</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black text-gray-900 dark:text-white truncate">{profile.full_name}</span>
                                    {isApproved && <ShieldCheck className="w-3 h-3 text-[#BEF264]" />}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="p-4 mt-auto border-t border-neutral-200 dark:border-white/10">
                <button
                    onClick={signOut}
                    title={isRetracted ? 'Sign Out' : ''}
                    className={`flex items-center transition-all rounded-2xl group
                        ${isRetracted ? 'justify-center py-3 w-full' : 'w-full gap-4 px-5 py-3 text-[0.85rem] uppercase tracking-widest font-black'}
                        text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10`}
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    {!isRetracted && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
