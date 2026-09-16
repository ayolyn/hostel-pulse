"use client";

import Link from 'react-hot-toast';
import { Bell, Menu, LayoutDashboard, User } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import LinkNext from 'next/link';
import { useSystemPulse } from '@/hooks/useSystemPulse';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { NotificationBell } from '../ui/NotificationBell';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';

interface AgentTopBarProps {
    onMenuClick: () => void;
    isSidebarRetracted: boolean;
}

export function AgentTopBar({ onMenuClick, isSidebarRetracted }: AgentTopBarProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const supabase = createClient();
    
    useEffect(() => {
        async function getUserId() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        }
        getUserId();
    }, [supabase]);



    return (
        <header className="h-20 lg:h-24 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-neutral-200 dark:border-white/5 px-6 lg:px-6 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-6">
                <div className="lg:hidden font-black uppercase tracking-widest text-xs text-[#BEF264] bg-black px-3 py-1.5 rounded-full ml-2">HP Agent</div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">


                <div className="flex items-center gap-3 sm:gap-4 ml-1 sm:ml-2 sm:border-l sm:border-neutral-200 dark:sm:border-white/10 sm:pl-4">
                    <ThemeToggle />
                    
                    <NotificationBell />
                    <UserProfileDropdown />
                </div>
            </div>
        </header>
    );
}
