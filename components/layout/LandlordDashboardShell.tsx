'use client';

import React from 'react';
import { LandlordSidebar } from './LandlordSidebar';
import { usePortal } from '@/components/auth/PortalGuard';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

export function LandlordDashboardShell({
    children,
    isApproved
}: {
    children: React.ReactNode;
    isApproved: boolean;
}) {
    const { isSidebarOpen, isRetracted, toggleSidebar, toggleRetract, setSidebarOpen } = usePortal();

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-neutral-950 transition-colors duration-500">
            {/* Sidebar */}
            <LandlordSidebar 
                isApproved={isApproved} 
                isOpen={isSidebarOpen} 
                isRetracted={isRetracted}
                onClose={() => setSidebarOpen(false)} 
                onRetractToggle={toggleRetract}
            />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isRetracted ? 'lg:pl-24' : 'lg:pl-72'}`}>
                {/* Fixed Top Header */}
                <header className={`fixed top-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-white/10 px-6 py-3 flex items-center justify-between transition-all duration-300 ${isRetracted ? 'lg:left-24' : 'lg:left-72'} left-0`}>
                    <div className="flex items-center gap-4">
                        <span className="lg:hidden text-[10px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-2 py-1 rounded-full">HP Landlord</span>
                        <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Landlord Portal</span>
                    </div>

                    <div className="flex-1 flex justify-end items-center gap-4">
                        <ThemeToggle />
                        <div className="h-6 w-px bg-neutral-200 dark:bg-white/10 mx-1 hidden sm:block" />
                        <NotificationBell />
                        <UserProfileDropdown />
                    </div>
                </header>

                <main className="pt-20 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-2 left-3 right-3 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <LandlordMobileNav />
            </div>
        </div>
    );
}

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function LandlordMobileNavContent() {
    const searchParams = useSearchParams();
    const tab = searchParams?.get('tab') || 'overview';
    
    const items = [
        { name: 'Home', tab: 'overview', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
        { name: 'Listings', tab: 'listings', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg> },
        { name: 'Inspect', tab: 'inspections', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> },
        { name: 'Inbox', tab: 'messages', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
        { name: 'Profile', tab: 'profile', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg> },
    ];
    
    const activeIndex = items.findIndex(item => item.tab === tab);

    return (
        <div className="bg-white dark:bg-neutral-950 shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-full flex items-center h-[64px] pointer-events-auto border border-neutral-200 dark:border-white/10 relative overflow-hidden">
            {activeIndex !== -1 && (
                <div 
                    className="absolute top-0 left-0 h-full pointer-events-none flex justify-center items-start pt-1"
                    style={{ 
                        width: `${100 / items.length}%`,
                        transform: `translateX(${activeIndex * 100}%)`,
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                    }}
                >
                    <svg width="56" height="36" viewBox="0 0 56 36" className="text-[#10b981] dark:text-[#BEF264] drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)] dark:drop-shadow-[0_2px_4px_rgba(190,242,100,0.2)]">
                        <path d="M0,36 C12,36 18,2 28,2 C38,2 44,36 56,36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
            )}
            
            {items.map((item) => {
                const active = tab === item.tab;
                return (
                    <Link 
                        key={item.tab}
                        href={`/dashboard/landlord?tab=${item.tab}`}
                        className="flex-1 flex flex-col items-center justify-center relative z-10 h-full"
                    >
                        <div className={`transition-all duration-300 absolute ${active ? 'top-2.5 text-[#10b981] dark:text-[#BEF264] scale-110' : 'top-3.5 text-gray-500'}`}>
                            {item.icon}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 absolute ${active ? 'bottom-2 text-[#10b981] dark:text-[#BEF264] opacity-100' : 'bottom-2 text-gray-500 opacity-80'}`}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}

function LandlordMobileNav() {
    return (
        <Suspense fallback={<div className="h-[64px]" />}>
            <LandlordMobileNavContent />
        </Suspense>
    );
}
