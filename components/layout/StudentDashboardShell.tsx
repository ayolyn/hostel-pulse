'use client';

import React from 'react';
import { Home, Search, Calendar, MessageSquare, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

const navItems = [
    { name: 'Home', href: '/dashboard/student', icon: Home, matchPrefix: false },
    { name: 'Find Hostel', href: '/rent', icon: Search, matchPrefix: true },
    { name: 'Inspections', href: '/dashboard/student?tab=inspections', icon: Calendar, matchPrefix: false },
    { name: 'Messages', href: '/dashboard/student?tab=messages', icon: MessageSquare, matchPrefix: false },
    { name: 'Profile', href: '/dashboard/student?tab=settings', icon: User, matchPrefix: false },
];

export function StudentDashboardShell({
    children
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const tab = searchParams?.get('tab');

    const isActive = (item: any) => {
        if (item.href.includes('?tab=')) {
            return tab === item.href.split('?tab=')[1];
        }
        if (item.matchPrefix) {
            return pathname.startsWith(item.href);
        }
        return pathname === item.href && !tab;
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-neutral-950 transition-colors duration-500 pb-20 md:pb-0">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-white/10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-[12px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-3 py-1.5 rounded-full">HP Student</span>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 ml-6">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={`text-sm font-bold uppercase tracking-widest transition-colors ${isActive(item) ? 'text-black dark:text-[#BEF264]' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                            >
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
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-white/10 pb-safe">
                <div className="flex items-center justify-around p-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link 
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center p-2 rounded-xl transition-all ${active ? 'text-[#BEF264]' : 'text-gray-400'}`}
                            >
                                <Icon className={`w-5 h-5 mb-1 ${active ? 'fill-[#BEF264]/20 stroke-2' : 'stroke-[1.5]'}`} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}