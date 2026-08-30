'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HostelPulseLogo } from '@/components/ui/HostelPulseLogo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useHostelPulse } from '@/hooks/useHostelPulse';
import { useMemo } from 'react';

const navLinks = [
    { name: 'Buy', href: '/buy' },
    { name: 'Shortlet', href: '/search?category=Hotel' },
    { name: 'Rent', href: '/rent' },
    { name: 'Providers', href: '/providers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Area Guides', href: '/area-guide' },
];

/**
 * PublicHeader — Used on all public-facing pages (/,/buy,/rent,/sell,/agents,/search...)
 * Renders Sign In + List your home, or Dashboard link if logged in.
 */
export function PublicHeader() {
    const pathname = usePathname();
    const { user, role } = useAuth();
    const isHome = pathname === '/';
    const { pulseColor, pulseLabel } = useHostelPulse(user?.id || null);

    const pulseStyles = useMemo(() => ({
        boxShadow: user ? `0 0 12px ${pulseColor}40` : 'none',
        borderColor: user ? `${pulseColor}30` : 'transparent'
    }), [user, pulseColor]);

    return (
        <nav className={cn(
            "fixed top-0 w-full z-50 transition-all duration-500 border-b",
            "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10 shadow-sm"
        )}>
            <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <HostelPulseLogo size={40} />
                </Link>

                {/* Navigation Links */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const hasDropdown = link.name === 'Buy' || link.name === 'Rent';
                        const dropdownItems = link.name === 'Buy' 
                            ? [
                                { label: 'Flats & Apartments For Sale', href: '/buy?category=Flat' },
                                { label: 'Houses For Sale', href: '/buy?category=House' },
                                { label: 'Lands For Sale', href: '/buy?category=Land' },
                                { label: 'Commercial Property For Sale', href: '/buy?category=Shop' },
                                { label: 'All Property For Sale', href: '/buy' },
                            ]
                            : [
                                { label: 'Flats & Apartments For Rent', href: '/rent?category=Flat' },
                                { label: 'Houses For Rent', href: '/rent?category=House' },
                                { label: 'Office Space For Rent', href: '/rent?category=Office' },
                                { label: 'Shops For Rent', href: '/rent?category=Shop' },
                                { label: 'Hostels For Rent', href: '/rent' },
                                { label: 'All Property For Rent', href: '/rent' },
                            ];

                        return (
                            <div key={link.name} className="relative group/nav">
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-bold uppercase tracking-widest transition-all relative py-8",
                                        "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#BEF264]"
                                    )}
                                >
                                    {link.name}
                                    <span className="absolute bottom-6 left-0 w-0 h-0.5 bg-[#BEF264] transition-all group-hover/nav:w-full" />
                                </Link>

                                {hasDropdown && (
                                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-200">
                                        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 rounded-2xl shadow-2xl min-w-[280px] overflow-hidden py-3">
                                            {dropdownItems.map((item, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={item.href}
                                                    className="block px-6 py-3 text-[13px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-[#BEF264] hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <ThemeToggle />
                    


                    <div className="h-6 w-[1px] bg-neutral-200 dark:bg-white/10 mx-2 hidden sm:block" />
                    
                    {user ? (
                        <Link
                            href={
                                role === 'student' ? '/dashboard/student' :
                                role === 'landlord' ? '/dashboard/landlord' :
                                role === 'agent' ? '/dashboard/agent' :
                                role === 'non_student' ? '/dashboard/non-student' :
                                '/dashboard'
                            }
                            className="bg-[#BEF264] text-black text-xs sm:text-sm font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/10 hover:shadow-xl hover:scale-105"
                        >
                            My Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/auth?mode=signin"
                                className={cn(
                                    "text-sm font-bold uppercase tracking-widest px-4 py-2 transition-colors",
                                    isHome ? "text-white hover:text-[#BEF264]" : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                                )}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth?mode=signup"
                                className="bg-[#BEF264] text-black text-xs sm:text-sm font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#a6d456] transition-all shadow-lg shadow-[#BEF264]/10 hover:shadow-xl hover:scale-105"
                            >
                                List your home
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
