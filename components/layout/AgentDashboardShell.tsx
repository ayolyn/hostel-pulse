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
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
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
        </div>
    );
}
