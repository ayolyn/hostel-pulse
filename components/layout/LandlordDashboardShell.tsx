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
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-black dark:hover:text-[#BEF264] transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Landlord Portal</span>
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
                <div className="bg-white dark:bg-neutral-950 shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-full flex items-center h-[64px] pointer-events-auto border border-neutral-200 dark:border-white/10 relative overflow-hidden">
                    <a href="/dashboard/landlord?tab=overview" className="flex-1 flex flex-col items-center justify-center relative z-10 h-full text-gray-500 hover:text-black dark:hover:text-white">
                        <svg className="w-5 h-5 mb-1 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
                    </a>
                    <a href="/dashboard/landlord?tab=listings" className="flex-1 flex flex-col items-center justify-center relative z-10 h-full text-gray-500 hover:text-black dark:hover:text-white">
                        <svg className="w-5 h-5 mb-1 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Listings</span>
                    </a>
                    <a href="/dashboard/landlord?tab=inspections" className="flex-1 flex flex-col items-center justify-center relative z-10 h-full text-gray-500 hover:text-black dark:hover:text-white">
                        <svg className="w-5 h-5 mb-1 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Inspect</span>
                    </a>
                    <a href="/dashboard/landlord?tab=profile" className="flex-1 flex flex-col items-center justify-center relative z-10 h-full text-gray-500 hover:text-black dark:hover:text-white">
                        <svg className="w-5 h-5 mb-1 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
