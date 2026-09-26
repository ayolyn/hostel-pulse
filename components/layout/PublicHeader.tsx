"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { Menu, X, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { HostelPulseLogo } from '@/components/ui/HostelPulseLogo';

const navLinks = [
    { name: 'Buy', href: '/buy' },
    { name: 'Shortlet', href: '/shortlet' },
    { name: 'Rent', href: '/rent' },
    { name: 'Providers', href: '/providers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Area Guides', href: 'https://lautech.xyz/' },
];

export function PublicHeader() {
    const pathname = usePathname();
    const { user, role } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const userRole = role?.toLowerCase();
    const dashboardLink = userRole === 'student' ? '/dashboard/student' :
                          userRole === 'landlord' ? '/dashboard/landlord' :
                          userRole === 'agent' ? '/dashboard/agent' :
                          userRole === 'non_student' ? '/dashboard/non-student' :
                          userRole === 'super_admin' ? '/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c' :
                          '/dashboard/student';

    return (
        <>
            <nav className="fixed top-4 inset-x-4 md:inset-x-6 z-50 transition-all duration-500 max-w-7xl mx-auto">
                <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-sm rounded-full h-16 px-4 md:px-6 flex items-center justify-between">
                    
                    {/* Sleek Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <HostelPulseLogo size={28} />
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
                                className="bg-[#BEF264] text-black text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#d9f99d] transition-all"
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
                                    className="bg-[#BEF264] text-black text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#d9f99d] transition-all"
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
                                    <HostelPulseLogo size={28} />
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
                                        className="px-5 py-4 mb-3 bg-gray-100/50 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#1a1a1a] rounded-2xl text-[1.1rem] font-bold text-gray-900 dark:text-white flex items-center justify-between transition-colors border border-transparent dark:border-white/5"
                                    >
                                        {link.name}
                                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/5 flex flex-col gap-3">
                                {user ? (
                                    <Link
                                        href={dashboardLink}
                                        className="w-full py-4 bg-[#BEF264] text-black text-center font-bold rounded-xl hover:bg-[#d9f99d] transition-all"
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
                                            className="w-full py-4 bg-[#BEF264] text-black text-center font-bold rounded-xl hover:bg-[#d9f99d] transition-all"
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
