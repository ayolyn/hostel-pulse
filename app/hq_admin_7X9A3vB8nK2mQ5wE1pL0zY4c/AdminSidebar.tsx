"use client";

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
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
    BookOpen
} from 'lucide-react';

export default function AdminSidebar() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'analytics';
    const router = useRouter();
    const supabase = createClient();
    const [isRetracted, setIsRetracted] = useState(false);

    const handleExit = async () => {
        await supabase.auth.signOut();
        router.push('/join');
    };

    const navItems = [
        { id: 'analytics', label: 'Analytics Engine', color: 'green', icon: LineChart },
        { id: 'verifications', label: 'Account Queue', color: 'green', icon: ShieldCheck },
        { id: 'users', label: 'User Management', color: 'blue', icon: Users },
        { id: 'escrow', label: 'Escrow Control', color: 'orange', icon: Wallet },
        { id: 'services', label: 'Student Services', color: 'blue', icon: LineChart },
        { id: 'support', label: 'Live Support', color: 'purple', icon: HeadphonesIcon },
        { id: 'disputes', label: 'Dispute Center', color: 'red', icon: MessageCircle },
        { id: 'alerts', label: 'System Alerts', color: 'green', icon: Megaphone },
        { id: 'blog', label: 'Blog CMS', color: 'purple', icon: BookOpen, path: '/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c/blog' },
    ] as const;

    return (
        <aside className={`
            relative bg-gray-900 border-r border-white/5 text-white h-screen sticky top-0 hidden lg:flex flex-col transition-all duration-300
            ${isRetracted ? 'w-20 p-4' : 'w-64 p-6'}
        `}>
            {/* Header */}
            <div className={`mb-10 flex items-center gap-2 ${isRetracted ? 'justify-center' : 'px-2'}`}>
                <div className="w-8 h-8 bg-[#BEF264] rounded-xl flex items-center justify-center text-black text-lg font-black shrink-0">H</div>
                {!isRetracted && <span className="text-xl font-black uppercase tracking-tighter truncate">Global HQ</span>}
            </div>

            {/* Retract Toggle */}
            <button 
                onClick={() => setIsRetracted(!isRetracted)}
                className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-[#BEF264] text-black border border-white dark:border-black rounded-full items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
            >
                <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isRetracted ? '' : 'rotate-180'}`} />
            </button>

            <nav className={`flex-1 space-y-2 text-gray-400 ${isRetracted ? 'items-center' : ''}`}>
                {!isRetracted && <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-500">Main Control</div>}
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const activeClass = item.color === 'red'
                        ? 'bg-red-500/10 text-red-400'
                        : item.color === 'blue'
                        ? 'bg-blue-500/10 text-blue-400'
                        : item.color === 'orange'
                        ? 'bg-orange-500/10 text-orange-400'
                        : item.color === 'purple'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-[#BEF264]/10 text-[#BEF264]';

                    return (
                        <Link
                            key={item.id}
                            href={'path' in item ? item.path : `?tab=${item.id}`}
                            scroll={false}
                            title={isRetracted ? item.label : ''}
                            className={`
                                flex items-center gap-3 transition-colors cursor-pointer rounded-xl font-medium
                                ${isRetracted ? 'justify-center p-3 w-full' : 'px-3 py-2.5 text-sm'}
                                ${isActive ? activeClass : 'hover:text-white'}
                            `}
                        >
                            {/* Icon if we had them or just labels */}
                            {item.icon ? (
                                <item.icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-500 group-hover:text-white'}`} />
                            ) : (
                                isActive && <span className={`w-1.5 h-1.5 rounded-full ${item.color === 'red' ? 'bg-red-400' : item.color === 'blue' ? 'bg-blue-400' : item.color === 'orange' ? 'bg-orange-400' : item.color === 'purple' ? 'bg-purple-400' : 'bg-[#BEF264]'}`} />
                            )}
                            {!isRetracted && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className={`pt-6 border-t border-white/5 ${isRetracted ? 'items-center flex flex-col' : ''}`}>
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
    );
}
