'use client';

import React, { useEffect, useState } from 'react';
import { Home, Search, Calendar, MessageSquare, User } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

const navItems = [
    { name: 'HOME', href: '/dashboard/student', icon: Home },
    { name: 'INSPECT', href: '/dashboard/student?tab=inspections', icon: Calendar },
    { name: 'SEARCH', href: '/rent', icon: Search },
    { name: 'INBOX', href: '/dashboard/student?tab=messages', icon: MessageSquare },
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

    const isActive = (name: string) => {
        if (!mounted) return false; // Prevent hydration mismatch on initial render for complex tab logic
        if (name === 'HOME') {
            return pathname === '/dashboard/student' && (!tab || tab === 'home');
        }
        if (name === 'INSPECT') {
            return pathname.startsWith('/dashboard/student/inspections') || tab === 'inspections';
        }
        if (name === 'SEARCH') {
            return pathname.startsWith('/rent') || pathname.startsWith('/search') || pathname.startsWith('/property');
        }
        if (name === 'INBOX') {
            return pathname.startsWith('/dashboard/student/messages') || pathname.startsWith('/messages') || tab === 'messages';
        }
        if (name === 'PROFILE') {
            return pathname.startsWith('/dashboard/student/profile') || pathname.startsWith('/profile') || tab === 'profile';
        }
        return false;
    };

    const activeIndex = navItems.findIndex(item => isActive(item.name));

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-neutral-950 transition-colors duration-500 pb-32 md:pb-0">
            {/* Top Header */}
            <header className="fixed top-4 left-4 right-4 md:left-8 md:right-8 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-6xl z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-neutral-200 dark:border-white/10 px-4 py-2.5 md:py-3 rounded-full flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="text-[12px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-3 py-1.5 rounded-full">HP Student</span>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-2 ml-auto mr-auto absolute left-1/2 -translate-x-1/2">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isActive(item.name) ? 'text-[#10b981] dark:text-[#34d399]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                            >
                                <item.icon className="w-3.5 h-3.5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 flex justify-end items-center gap-4">
                    <ThemeToggle />
                    <div className="h-6 w-px bg-neutral-200 dark:bg-white/10 mx-1 hidden sm:block" />
                    <NotificationBell />
                    <UserProfileDropdown />
                </div>
            </header>

            <main className="pt-20 w-full">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="bg-neutral-950 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-t-3xl flex items-center h-[64px] pointer-events-auto border-t border-white/10 relative">
                    
                    {/* Bump Indicator */}
                    {activeIndex !== -1 && (
                        <div 
                            className="absolute top-0 left-0 h-full pointer-events-none flex justify-center"
                            style={{ 
                                width: `${100 / navItems.length}%`,
                                transform: `translateX(${activeIndex * 100}%)`,
                                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                            }}
                        >
                            <svg width="76" height="32" viewBox="0 0 76 32" className="absolute -top-[31px] text-neutral-950 drop-shadow-[0_-4px_6px_rgba(190,242,100,0.15)]">
                                <path d="M0,32 C15,32 20,0 38,0 C56,0 61,32 76,32 Z" fill="currentColor" />
                                <path d="M0,32 C15,32 20,0 38,0 C56,0 61,32 76,32" fill="none" stroke="#BEF264" strokeWidth="1.5" className="opacity-80" />
                            </svg>
                        </div>
                    )}

                    {/* Nav Items */}
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = activeIndex === index;
                        
                        return (
                            <Link 
                                key={item.name}
                                href={item.href}
                                className="flex-1 flex flex-col items-center justify-center relative z-10 h-full"
                            >
                                <Icon 
                                    className={`w-5 h-5 transition-all duration-300 ease-out absolute ${active ? 'top-3 text-[#BEF264] stroke-[2.5] scale-110' : 'top-3.5 text-gray-500 stroke-[2]'}`} 
                                />
                                <span 
                                    className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 absolute ${active ? 'bottom-2 text-[#BEF264] opacity-100' : 'bottom-2 text-gray-500 opacity-80'}`}
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




