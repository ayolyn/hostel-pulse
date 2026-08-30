'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search, ShoppingBag, Home, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '@/components/providers/AuthProvider';
import { useHostelPulse } from '@/hooks/useHostelPulse';
import { useMemo } from 'react';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

const nonStudentLinks = [
    { name: 'Buy', href: '/buy', icon: ShoppingBag },
    { name: 'Rent', href: '/rent', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
];

/**
 * NonStudentHeader — For logged-in non-student buyers/renters.
 * Shows Buy, Rent, Search and saved properties.
 */
export function NonStudentHeader() {
    const { user, signOut } = useAuth();
    const { pulseColor, pulseLabel } = useHostelPulse(user?.id || null);

    const pulseStyles = useMemo(() => ({
        boxShadow: `0 0 12px ${pulseColor}40`,
        borderColor: `${pulseColor}30`
    }), [pulseColor]);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard/non-student" className="flex items-center gap-3 group">
                    <Image src="/logo.png" alt="HostelPulse" width={140} height={40} className="h-8 w-auto object-contain transition-opacity group-hover:opacity-80 block dark:hidden" priority />
                    <Image src="/logo-dark.png" alt="HostelPulse" width={140} height={40} className="h-8 w-auto object-contain transition-opacity group-hover:opacity-80 hidden dark:block" priority />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black bg-[#BEF264] px-2 py-1 rounded-md hidden sm:block">Buyer</span>
                </Link>

                {/* Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {nonStudentLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-[#BEF264] transition-colors"
                        >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    
                    {/* HostelPulse Dynamic Indicator */}
                    <button 
                        className="hidden sm:flex group relative items-center gap-2 px-3 py-1.5 rounded-full border bg-neutral-50 dark:bg-white/5 transition-all hover:bg-neutral-100 dark:hover:bg-white/10"
                        style={pulseStyles}
                        title={pulseLabel}
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: pulseColor }}></span>
                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: pulseColor }}></span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                            Sense
                        </span>
                    </button>
                    
                    <div className="h-6 w-px bg-neutral-200 dark:bg-white/10 mx-1 hidden sm:block" />
                    
                    <NotificationBell />
                    <UserProfileDropdown />
                </div>
            </div>
        </nav>
    );
}
