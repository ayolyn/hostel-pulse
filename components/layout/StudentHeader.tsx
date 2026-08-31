'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, BookOpen, Calendar, Heart, Search, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSaved } from '@/components/providers/SavedProvider';
import { useHostelPulse } from '@/hooks/useHostelPulse';
import { useMemo } from 'react';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

const studentLinks = [
    { name: 'Search', href: '/rent', icon: Search },
    { name: 'Saved', href: '/dashboard/student?tab=saved', icon: Heart },
    { name: 'Inspections', href: '/dashboard/student?tab=inspections', icon: Calendar },
];

/**
 * StudentHeader — Used inside the Student dashboard and student-viewed pages.
 * Shows student-relevant nav: Search, Saved, Inspections.
 */
export function StudentHeader() {
    const { user, signOut } = useAuth();
    const { savedCount } = useSaved();
    const { pulseColor, pulseLabel } = useHostelPulse(user?.id || null);

    const pulseStyles = useMemo(() => ({
        boxShadow: `0 0 12px ${pulseColor}40`,
        borderColor: `${pulseColor}30`
    }), [pulseColor]);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard/student" className="flex items-center gap-3 group">
                    <Image src="/logo.png" alt="HostelPulse" width={140} height={40} className="h-6 w-auto object-contain transition-opacity group-hover:opacity-80 block dark:hidden" priority />
                    <Image src="/logo-dark.png" alt="HostelPulse" width={140} height={40} className="h-6 w-auto object-contain transition-opacity group-hover:opacity-80 hidden dark:block" priority />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-2 py-1 rounded-md hidden sm:block">Student</span>
                </Link>

                {/* Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {studentLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-[#BEF264] transition-colors relative group/link"
                        >
                            <link.icon className="w-4 h-4" />
                            <span>{link.name}</span>
                            {link.name === 'Saved' && savedCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-[#BEF264] text-black text-[8px] px-1.5 py-0.5 rounded-full font-black border-2 border-white dark:border-neutral-900 group-hover/link:scale-110 transition-transform">
                                    {savedCount}
                                </span>
                            )}
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
