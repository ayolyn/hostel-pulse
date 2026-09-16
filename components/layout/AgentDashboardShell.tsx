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
                <AgentMobileNav />
            </div>
        </div>
    );
}

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function AgentMobileNavContent() {
    const searchParams = useSearchParams();
    const tab = searchParams?.get('tab') || 'overview';
    
    const items = [
        { name: 'Home', tab: 'overview', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> },
        { name: 'Zone', tab: 'zone', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg> },
        { name: 'Inspect', tab: 'inspections', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> },
        { name: 'Inbox', tab: 'messages', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
        { name: 'Profile', tab: 'profile', icon: <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
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
                        href={`/dashboard/agent?tab=${item.tab}`}
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

function AgentMobileNav() {
    return (
        <Suspense fallback={<div className="h-[64px]" />}>
            <AgentMobileNavContent />
        </Suspense>
    );
}
