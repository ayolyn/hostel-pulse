const fs = require('fs');

const content = `"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

const navLinks = [
    { name: 'Buy', href: '/buy' },
    { name: 'Shortlet', href: '/search?category=Hotel' },
    { name: 'Rent', href: '/rent' },
    { name: 'Providers', href: '/providers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Area Guides', href: 'https://lautech.xyz/' },
];

export function PublicHeader() {
    const pathname = usePathname();
    const { user, role } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dashboardLink = role === 'student' ? '/dashboard/student' :
                          role === 'landlord' ? '/dashboard/landlord' :
                          role === 'agent' ? '/dashboard/agent' :
                          role === 'non_student' ? '/dashboard/non-student' :
                          '/dashboard';

    return (
        <>
            <nav className="fixed top-4 inset-x-4 md:inset-x-6 z-50 transition-all duration-500 max-w-7xl mx-auto">
                <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-sm rounded-full h-16 px-4 md:px-6 flex items-center justify-between">
                    
                    {/* Sleek Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <span className="text-emerald-500 font-black text-xl leading-none">H</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                            HostelPulse
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target={link.href.startsWith('http') ? "_blank" : undefined}
                                    className={cn(
                                        "text-sm font-semibold tracking-wide transition-colors",
                                        isActive 
                                            ? "text-emerald-500 dark:text-emerald-400" 
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop Right Actions */}
                    <div className="hidden lg:flex items-center gap-4">
                        <ThemeToggle />
                        <div className="h-4 w-px bg-gray-200 dark:bg-white/10"></div>
                        {user ? (
                            <Link
                                href={dashboardLink}
                                className="bg-emerald-500 text-black text-sm font-bold px-5 py-2.5 rounded-full hover:bg-emerald-400 transition-all"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/auth?mode=signin"
                                    className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/auth?mode=signup"
                                    className="bg-emerald-500 text-black text-sm font-bold px-5 py-2.5 rounded-full hover:bg-emerald-400 transition-all"
                                >
                                    List Home
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="flex lg:hidden items-center gap-3">
                        <ThemeToggle />
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 text-gray-900 dark:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/10 z-[70] shadow-2xl flex flex-col p-6 lg:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <span className="text-emerald-500 font-black text-xl leading-none">H</span>
                                    </div>
                                    <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                                        HostelPulse
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-900 dark:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        target={link.href.startsWith('http') ? "_blank" : undefined}
                                        className="py-4 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 flex items-center justify-between group"
                                    >
                                        {link.name}
                                        <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">?</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/5 flex flex-col gap-3">
                                {user ? (
                                    <Link
                                        href={dashboardLink}
                                        className="w-full py-4 bg-emerald-500 text-black text-center font-bold rounded-xl"
                                    >
                                        My Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth?mode=signin"
                                            className="w-full py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-center font-bold rounded-xl"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/auth?mode=signup"
                                            className="w-full py-4 bg-emerald-500 text-black text-center font-bold rounded-xl"
                                        >
                                            List your home
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
`;

fs.writeFileSync('components/layout/PublicHeader.tsx', content, 'utf8');
console.log('Rewrote PublicHeader for sleek mobile design');
