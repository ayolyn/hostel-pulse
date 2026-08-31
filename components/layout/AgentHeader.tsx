'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, MapPin, Calendar, Wallet, Trophy, LogOut, MessageSquare } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { useHostelPulse } from '@/hooks/useHostelPulse';

const agentLinks = [
    { name: 'My Zone', tabName: 'zone', href: '/dashboard/agent?tab=zone', icon: MapPin },
    { name: 'Inspections', tabName: 'inspections', href: '/dashboard/agent?tab=inspections', icon: Calendar },
    { name: 'Wallet', tabName: 'wallet', href: '/dashboard/agent?tab=wallet', icon: Wallet },
    { name: 'Leaderboard', tabName: 'rank', href: '/dashboard/agent?tab=rank', icon: Trophy },
    { name: 'Messages', tabName: 'messages', href: '/dashboard/agent?tab=messages', icon: MessageSquare },
];

function AgentNavLinks({ isApproved }: { isApproved: boolean }) {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    return (
        <div className="hidden md:flex items-center gap-6">
            {agentLinks.map((link) => {
                const isActive = activeTab === link.tabName;
                const isDisabled = !isApproved && (link.tabName === 'zone' || link.tabName === 'wallet');

                return (
                    <Link
                        key={link.name}
                        href={isDisabled ? '#' : link.href}
                        className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                            isDisabled ? 'text-neutral-700 cursor-not-allowed line-through decoration-red-500/50' :
                            isActive ? 'text-[#BEF264]' : 'text-neutral-400 hover:text-[#BEF264]'
                        }`}
                        style={isActive && !isDisabled ? { textShadow: '0 0 10px rgba(190, 242, 100, 0.4)' } : undefined}
                        title={isDisabled ? 'Locked pending HQ Security Approval' : undefined}
                    >
                        <link.icon className={`w-4 h-4 ${isActive && !isDisabled ? 'text-[#BEF264] drop-shadow-[0_0_8px_rgba(190,242,100,0.8)]' : ''}`} />
                        {link.name}
                    </Link>
                );
            })}
        </div>
    );
}

/**
 * AgentHeader — For verified HOSTELPULSE agents.
 * Shows zone management, inspection queue, wallet, and rank.
 */
export function AgentHeader({ isApproved = true }: { isApproved?: boolean }) {
    const { user, signOut } = useAuth();
    const { pulseColor, pulseLabel } = useHostelPulse(user?.id || null);

    const pulseStyles = useMemo(() => ({
        boxShadow: `0 0 12px ${pulseColor}40`,
        borderColor: `${pulseColor}30`
    }), [pulseColor]);

    return (
        <nav className="fixed top-0 w-full z-50 bg-black border-b border-white/5 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard/agent" className="flex items-center gap-3 group">
                    <Image src="/logo-dark.png" alt="HostelPulse" width={140} height={40} className="h-6 w-auto object-contain transition-opacity group-hover:opacity-80" priority />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black bg-[#BEF264] px-2 py-1 rounded-md hidden sm:block">Agent HQ</span>
                </Link>

                {/* Nav */}
                <Suspense fallback={<div className="hidden md:flex items-center gap-6 animate-pulse bg-white/5 h-8 w-64 rounded-full" />}>
                    <AgentNavLinks isApproved={isApproved} />
                </Suspense>

                {/* Right */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    
                    <div className="h-6 w-[1px] bg-white/10" />
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors px-3 py-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
