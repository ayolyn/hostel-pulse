'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, MessageSquare, LogOut, Menu } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '@/components/providers/AuthProvider';
import { useHostelPulse } from '@/hooks/useHostelPulse';
import { useMemo } from 'react';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

interface LandlordHeaderProps {
    onMenuClick?: () => void;
}

const publicLinks = [
    { name: 'Buy', href: '/buy' },
    { name: 'Rent', href: '/rent' },
    { name: 'Search Agents', href: '/agents' },
    { name: 'Blog', href: '/blog' },
];

/**
 * LandlordHeader — For logged-in landlords/property owners.
 * Shows listing management, inspections, wallet controls.
 */
export function LandlordHeader({ onMenuClick }: LandlordHeaderProps) {
    const { user, signOut } = useAuth();
    const { pulseColor, pulseLabel } = useHostelPulse(user?.id || null);

    const pulseStyles = useMemo(() => ({
        boxShadow: `0 0 12px ${pulseColor}40`,
        borderColor: `${pulseColor}30`
    }), [pulseColor]);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 group mr-2 sm:mr-8">
                        {/* Menu Toggle Button (Visible on all screens) */}
                        <button 
                            onClick={onMenuClick}
                            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        <Link href="/" className="group flex items-center">
                            <Image src="/logo.png" alt="HostelPulse" width={140} height={40} className="h-6 w-auto object-contain transition-opacity group-hover:opacity-80 block dark:hidden" priority />
                            <Image src="/logo-dark.png" alt="HostelPulse" width={140} height={40} className="h-6 w-auto object-contain transition-opacity group-hover:opacity-80 hidden dark:block" priority />
                        </Link>
                        <Link href="/dashboard/landlord" className="text-[10px] font-black uppercase tracking-widest text-black bg-[#BEF264] px-2 py-1 rounded-md hidden sm:block ml-2">Landlord</Link>
                    </div>
                </div>

                {/* Center Navigation (Stay logged in but explore site) */}
                <div className="hidden lg:flex items-center gap-5">
                    {publicLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right Area */}
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
