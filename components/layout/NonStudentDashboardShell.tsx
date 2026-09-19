'use client';

import { useState, Suspense, useEffect } from 'react';
import { NonStudentSidebar } from './NonStudentSidebar';
import { Menu, Home, Calendar, Heart, MessageSquare, User } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const mobileNavItems = [
    { name: 'HOME', href: '/dashboard/non-student?tab=overview', icon: Home, tab: 'overview' },
    { name: 'REQUESTS', href: '/dashboard/non-student?tab=requests', icon: Calendar, tab: 'requests' },
    { name: 'SAVED', href: '/dashboard/non-student?tab=saved', icon: Heart, tab: 'saved' },
    { name: 'INBOX', href: '/dashboard/non-student?tab=messages', icon: MessageSquare, tab: 'messages' },
    { name: 'PROFILE', href: '/dashboard/non-student?tab=profile', icon: User, tab: 'profile' },
];

function NonStudentDashboardShellContent({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isRetracted, setIsRetracted] = useState(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const tab = searchParams?.get('tab') || 'overview';
    
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (itemTab: string) => {
        if (!mounted) return false;
        return tab === itemTab;
    };

    const activeIndex = mobileNavItems.findIndex(item => isActive(item.tab));

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-500 pb-32 lg:pb-0">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Top Nav (Mobile & Desktop) */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#111]/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 h-16 sm:h-20 max-w-7xl mx-auto">
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Buyer / Renter Hub</span>
                        </div>

                    <div className="flex-1 flex justify-end items-center gap-4">
                        <ThemeToggle />
                        <div className="h-6 w-px bg-neutral-200 dark:bg-white/10 mx-1 hidden sm:block" />
                        <NotificationBell />
                        <UserProfileDropdown />
                    </div>
                </header>

                <main className="pt-16 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-2 left-3 right-3 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="bg-white dark:bg-neutral-950 shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-full flex items-center h-[64px] pointer-events-auto border border-neutral-200 dark:border-white/10 relative overflow-hidden">
                    
                    {/* Arch Indicator inside the bar */}
                    {activeIndex !== -1 && (
                        <div 
                            className="absolute top-0 left-0 h-full pointer-events-none flex justify-center items-start pt-1"
                            style={{ 
                                width: `${100 / mobileNavItems.length}%`,
                                transform: `translateX(${activeIndex * 100}%)`,
                                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                            }}
                        >
                            <svg width="56" height="36" viewBox="0 0 56 36" className="text-[#10b981] dark:text-[#BEF264] drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)] dark:drop-shadow-[0_2px_4px_rgba(190,242,100,0.2)]">
                                <path d="M0,36 C12,36 18,2 28,2 C38,2 44,36 56,36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    )}

                    {/* Nav Items */}
                    {mobileNavItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = activeIndex === index;
                        
                        return (
                            <Link 
                                key={item.name}
                                href={item.href}
                                className="flex-1 flex flex-col items-center justify-center relative z-10 h-full"
                            >
                                <Icon 
                                    className={`w-5 h-5 transition-all duration-300 ease-out absolute ${active ? 'top-2.5 text-[#10b981] dark:text-[#BEF264] stroke-[2.5] scale-110' : 'top-3.5 text-gray-500 stroke-[2]'}`} 
                                />
                                <span 
                                    className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 absolute ${active ? 'bottom-2 text-[#10b981] dark:text-[#BEF264] opacity-100' : 'bottom-2 text-gray-500 opacity-80'}`}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function NonStudentDashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-neutral-950" />}>
            <NonStudentDashboardShellContent>{children}</NonStudentDashboardShellContent>
        </Suspense>
    );
}
