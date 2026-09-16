'use client';

import React, { useEffect, useState } from 'react';
import { Home, Search, Calendar, MessageSquare, User, Map, Users, ShoppingBag, Heart, HelpCircle } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';
import { HostelPulseLogo } from '../ui/HostelPulseLogo';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

const desktopNavItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Find Hostel', href: '/rent', icon: Search },
    { name: 'Explore Map', href: '/explore', icon: Map },
    { name: 'Roommates', href: '/roommates', icon: Users },
    { name: 'Campus Market', href: '/market', icon: ShoppingBag },
    { name: 'Campus Gigs', href: '/services', icon: ShoppingBag },
    { name: 'Inspections', href: '/dashboard/student?tab=inspections', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
];

const bottomNavItems = [
    { name: 'Saved', href: '/dashboard/student?tab=saved', icon: Heart }, 
    { name: 'Support', href: '/dashboard/student?tab=support', icon: HelpCircle },
    { name: 'Profile & Settings', href: '/dashboard/student?tab=profile', icon: User },
];

const mobileNavItems = [
    { name: 'HOME', href: '/dashboard/student', icon: Home },
    { name: 'SEARCH', href: '/rent', icon: Search },
    { name: 'MAP', href: '/explore', icon: Map },
    { name: 'MARKET', href: '/market', icon: ShoppingBag },
    { name: 'INBOX', href: '/messages', icon: MessageSquare },
    { name: 'PROFILE', href: '/dashboard/student?tab=profile', icon: User },
];

import { Suspense } from 'react';



function StudentDashboardShellContent({
    children
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    
    const searchParams = useSearchParams();
    const tab = searchParams?.get('tab');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (name: string, href: string) => {
        if (!mounted) return false;
        
        // Exact match for dashboard home
        if (href === '/dashboard/student') {
            return pathname === '/dashboard/student' && (!tab || tab === 'home');
        }
        
        // Match path prefix for others
        if (href.startsWith('/dashboard/student?tab=')) {
            const targetTab = href.split('=')[1];
            return tab === targetTab;
        }
        
        if (pathname.startsWith(href)) return true;
        
        // Fallbacks for specific tabs if path routing fails
        if (name === 'HOME' || name === 'Dashboard') return pathname === '/dashboard/student' && (!tab || tab === 'home');
        if (name === 'INSPECT' || name === 'Inspections') return pathname.startsWith('/dashboard/student/inspections') || tab === 'inspections';
        if (name === 'MAP' || name === 'Explore Map') return pathname.startsWith('/explore');
        if (name === 'ROOMMATES' || name === 'Roommates') return pathname.startsWith('/roommates');
        if (name === 'SEARCH' || name === 'Find Hostel') return pathname.startsWith('/rent') || pathname.startsWith('/search') || pathname.startsWith('/property');
        if (name === 'MARKET' || name === 'Campus Market') return pathname.startsWith('/market') || tab === 'market';
        if (name === 'Campus Gigs') return pathname.startsWith('/services');
        if (name === 'INBOX' || name === 'Messages') return pathname.startsWith('/dashboard/student/messages') || pathname.startsWith('/messages') || tab === 'messages';
        if (name === 'PROFILE' || name === 'Profile & Settings') return pathname.startsWith('/dashboard/student/profile') || pathname.startsWith('/profile') || tab === 'profile';
        if (name === 'Saved') return tab === 'saved';
        if (name === 'Support') return tab === 'support';
        
        return false;
    };

    const activeIndex = mobileNavItems.findIndex(item => isActive(item.name, item.href));

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-neutral-950 transition-colors duration-500 pb-32 md:pb-0">
            
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 fixed top-0 left-0 bottom-0 bg-white dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-white/10 z-40 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <HostelPulseLogo className="h-7" />
                </div>
                <div className="flex-1 overflow-y-auto pr-2 pb-4 no-scrollbar">
                    <nav className="space-y-1">
                        {desktopNavItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-4 ${isActive(item.name, item.href) ? 'bg-[#10b981]/10 dark:bg-[#34d399]/10 text-[#10b981] dark:text-[#34d399] font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 mt-auto">
                    <nav className="space-y-1">
                        {bottomNavItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-4 ${isActive(item.name, item.href) ? 'bg-[#10b981]/10 dark:bg-[#34d399]/10 text-[#10b981] dark:text-[#34d399] font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Top Header */}
            <header className="fixed top-0 lg:top-4 left-0 lg:left-[272px] right-0 lg:right-4 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b lg:border border-neutral-200 dark:border-white/10 px-4 lg:px-6 py-2.5 lg:rounded-full flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 lg:hidden">
                    <HostelPulseLogo variant="icon" className="w-8 h-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-2 py-1 rounded-full">HP Student</span>
                </div>
                <div className="hidden lg:block flex-1" />
                <div className="flex items-center gap-4 justify-end">
                    <ThemeToggle />
                    <div className="h-6 w-px bg-neutral-200 dark:bg-white/10 mx-1 hidden sm:block" />
                    <NotificationBell />
                    <UserProfileDropdown />
                </div>
            </header>

            <main className="pt-20 w-full min-h-screen lg:pl-[272px]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8 lg:pr-4">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-2 left-3 right-3 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
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

export function StudentDashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-neutral-950" />}>
            <StudentDashboardShellContent>{children}</StudentDashboardShellContent>
        </Suspense>
    );
}




