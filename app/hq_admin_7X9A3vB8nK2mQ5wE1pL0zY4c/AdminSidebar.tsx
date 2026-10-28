"use client";

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
    LayoutDashboard, 
    ShieldCheck, 
    MessageCircle, 
    LineChart, 
    ChevronRight, 
    LogOut,
    Users,
    Wallet,
    HeadphonesIcon,
    Megaphone,
    BookOpen,
    Banknote,
    Layers,
    X
} from 'lucide-react';

export default function AdminSidebar() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'analytics';
    const pathname = usePathname();
    const ADMIN_BASE = '/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c';
    const router = useRouter();
    const supabase = createClient();
    const [isRetracted, setIsRetracted] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => setIsMobileOpen(prev => !prev);
        const handleClose = () => setIsMobileOpen(false);

        window.addEventListener('toggle-admin-mobile-sidebar', handleToggle);
        window.addEventListener('close-admin-mobile-sidebar', handleClose);

        return () => {
            window.removeEventListener('toggle-admin-mobile-sidebar', handleToggle);
            window.removeEventListener('close-admin-mobile-sidebar', handleClose);
        };
    }, []);

    // Close mobile drawer when route/tab changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname, activeTab]);

    const handleExit = async () => {
        await supabase.auth.signOut();
        router.push('/join');
    };

    const navItems = [
        { id: 'analytics', label: 'Analytics Engine', color: 'green', icon: LineChart },
        { id: 'payouts', label: 'Payout Approvals', color: 'green', icon: Banknote },
        { id: 'properties', label: 'Property Review', color: 'green', icon: LayoutDashboard },
        { id: 'duplicates', label: 'Duplicate Review', color: 'orange', icon: Layers },
        { id: 'verifications', label: 'Account Queue', color: 'green', icon: ShieldCheck },
        { id: 'users', label: 'User Management', color: 'blue', icon: Users },
        { id: 'escrow', label: 'Escrow Control', color: 'orange', icon: Wallet },
        { id: 'services', label: 'Student Services', color: 'blue', icon: LineChart },
        { id: 'support', label: 'Live Support', color: 'purple', icon: HeadphonesIcon },
        { id: 'disputes', label: 'Dispute Center', color: 'red', icon: MessageCircle },
        { id: 'alerts', label: 'System Alerts', color: 'green', icon: Megaphone },
        { id: 'blog', label: 'Blog CMS', color: 'purple', icon: BookOpen, path: '/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/blog' },
    ] as const;

    const renderNavLinks = (retracted: boolean, onItemClick?: () => void) => (
        <nav className={`flex-1 min-h-0 overflow-y-auto space-y-1.5 text-gray-400 custom-scrollbar ${retracted ? 'items-center' : 'pr-1'}`}>
            {!retracted && <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-500">Main Control</div>}
            {navItems.map((item) => {
                const isActive = 'path' in item ? pathname === item.path : (activeTab === item.id && pathname === ADMIN_BASE);
                const activeClass = item.color === 'red'
                    ? 'bg-red-500/10 text-red-400 font-bold'
                    : item.color === 'blue'
                    ? 'bg-blue-500/10 text-blue-400 font-bold'
                    : item.color === 'orange'
                    ? 'bg-orange-500/10 text-orange-400 font-bold'
                    : item.color === 'purple'
                    ? 'bg-purple-500/10 text-purple-400 font-bold'
                    : 'bg-[#BEF264]/10 text-[#BEF264] font-bold';

                return (
                    <Link
                        key={item.id}
                        href={'path' in item ? item.path : `${ADMIN_BASE}?tab=${item.id}`}
                        scroll={false}
                        onClick={onItemClick}
                        title={retracted ? item.label : ''}
                        className={`
                            flex items-center gap-3 transition-colors cursor-pointer rounded-xl font-medium
                            ${retracted ? 'justify-center p-3 w-full' : 'px-3 py-2.5 text-sm'}
                            ${isActive ? activeClass : 'hover:text-white hover:bg-white/5'}
                        `}
                    >
                        {item.icon ? (
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'text-gray-500 group-hover:text-white'}`} />
                        ) : (
                            isActive && <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${item.color === 'red' ? 'bg-red-400' : item.color === 'blue' ? 'bg-blue-400' : item.color === 'orange' ? 'bg-orange-400' : item.color === 'purple' ? 'bg-purple-400' : 'bg-[#BEF264]'}`} />
                        )}
                        {!retracted && <span className="truncate">{item.label}</span>}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <>
            {/* Mobile Backdrop & Drawer */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside 
                className={`
                    fixed inset-y-0 left-0 w-72 bg-gray-900 border-r border-white/5 text-white z-50 flex flex-col p-6 lg:hidden shadow-2xl transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Mobile Header with Close Button */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#BEF264] rounded-xl flex items-center justify-center text-black text-lg font-black shrink-0">H</div>
                        <span className="text-lg font-black uppercase tracking-tighter">Global HQ</span>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {renderNavLinks(false, () => setIsMobileOpen(false))}

                <div className="pt-4 mt-auto border-t border-white/5 shrink-0">
                    <div className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-widest text-center">God Mode Active</div>
                    <button
                        onClick={handleExit}
                        className="flex items-center justify-center text-red-400 hover:bg-red-400/10 border border-red-500/20 transition-colors cursor-pointer rounded-xl gap-3 px-3 py-2.5 w-full text-[10px] uppercase font-black tracking-widest"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Exit Portal</span>
                    </button>
                </div>
            </aside>

            {/* Desktop Persistent Sidebar */}
            <aside className={`
                relative bg-gray-900 border-r border-white/5 text-white h-screen shrink-0 hidden lg:flex flex-col transition-all duration-300
                ${isRetracted ? 'w-20 p-4' : 'w-64 p-6'}
            `}>
                {/* Desktop Header */}
                <div className={`mb-6 flex items-center gap-3 shrink-0 ${isRetracted ? 'justify-center' : 'px-2'}`}>
                    <div className="w-8 h-8 bg-[#BEF264] rounded-xl flex items-center justify-center text-black text-lg font-black shrink-0">H</div>
                    {!isRetracted && <span className="text-xl font-black uppercase tracking-tighter truncate">Global HQ</span>}
                </div>

                {/* Retract Toggle */}
                <button 
                    onClick={() => setIsRetracted(!isRetracted)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[#BEF264] text-black border border-white dark:border-black rounded-full items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                    title={isRetracted ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isRetracted ? '' : 'rotate-180'}`} />
                </button>

                {renderNavLinks(isRetracted)}

                <div className={`pt-4 mt-auto border-t border-white/5 shrink-0 ${isRetracted ? 'items-center flex flex-col' : ''}`}>
                    {!isRetracted && <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-widest text-center">God Mode Active</div>}
                    <button
                        onClick={handleExit}
                        title={isRetracted ? 'Exit Portal' : ''}
                        className={`
                            flex items-center justify-center text-red-400 hover:bg-red-400/10 border border-red-500/20 transition-colors cursor-pointer rounded-xl
                            ${isRetracted ? 'w-10 h-10 p-0' : 'gap-3 px-3 py-2.5 w-full text-[10px] uppercase font-black tracking-widest'}
                        `}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!isRetracted && <span>Exit Portal</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
