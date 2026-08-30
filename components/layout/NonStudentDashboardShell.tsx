'use client';

import { useState, Suspense } from 'react';
import { NonStudentSidebar } from './NonStudentSidebar';
import { NonStudentHeader } from './NonStudentHeader';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';
import { GlobalSupportWidget } from '../messages/GlobalSupportWidget';

export function NonStudentDashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isRetracted, setIsRetracted] = useState(false);

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-neutral-950" />}>
            <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
                {/* Sidebar */}
                <NonStudentSidebar 
                    isOpen={sidebarOpen} 
                    isRetracted={isRetracted}
                    onClose={() => setSidebarOpen(false)} 
                    onRetractToggle={() => setIsRetracted(!isRetracted)}
                />

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" 
                        onClick={() => setSidebarOpen(false)} 
                    />
                )}

                <GlobalSupportWidget />

            {/* Main Content Area */}
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
                        <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Buyer / Renter Hub</span>
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
            </div>
        </Suspense>
    );
}
