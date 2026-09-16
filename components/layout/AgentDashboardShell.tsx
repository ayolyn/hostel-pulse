"use client";

import React from 'react';
import { AgentSidebar } from './AgentSidebar';
import { AgentTopBar } from './AgentTopBar';
import { usePortal } from '@/components/auth/PortalGuard';

export function AgentDashboardShell({
    children,
    userId
}: {
    children: React.ReactNode;
    userId: string;
}) {
    const { isSidebarOpen, isRetracted, toggleSidebar, toggleRetract, setSidebarOpen } = usePortal();

    return (
        <div className="flex min-h-screen bg-white dark:bg-black transition-colors duration-500">
            {/* Sidebar */}
            <AgentSidebar 
                isOpen={isSidebarOpen} 
                isRetracted={isRetracted}
                onClose={() => setSidebarOpen(false)} 
                onRetractToggle={toggleRetract}
                userId={userId}
            />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isRetracted ? 'lg:ml-24' : 'lg:ml-72'}`}>
                <AgentTopBar onMenuClick={toggleSidebar} isSidebarRetracted={isRetracted} />

                <main className="w-full flex-1">
                    <div className="max-w-7xl mx-auto px-6 lg:px-6 py-10 lg:py-16">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-2 left-3 right-3 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="bg-white dark:bg-neutral-950 shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-full flex items-center h-[64px] pointer-events-auto border border-neutral-200 dark:border-white/10 relative overflow-hidden">
                    <a href="/dashboard/agent?tab=overview" className="flex-1 flex flex-col items-center justify-center relative z-10 h-full text-gray-500 hover:text-black dark:hover:text-white">
                        <svg className="w-5 h-5 mb-1 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
                    </a>
                    <a href="/dashboard/agent?tab=zone" className="flex-1 flex flex-col items-center justify-center relative z-10 h-full text-gray-500 hover:text-black dark:hover:text-white">
                        <svg className="w-5 h-5 mb-1 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Zone</span>
                    </a>
                    <a href="/dashboard/agent?tab=inspections" className="flex-1 flex flex-col items-center justify-center relative z-10 h-full text-gray-500 hover:text-black dark:hover:text-white">
                        <svg className="w-5 h-5 mb-1 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Inspect</span>
                    </a>
                    <a href="/dashboard/agent?tab=profile" className="flex-1 flex flex-col items-center justify-center relative z-10 h-full text-gray-500 hover:text-black dark:hover:text-white">
                        <svg className="w-5 h-5 mb-1 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
