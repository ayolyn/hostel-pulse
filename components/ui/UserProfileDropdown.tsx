'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

export function UserProfileDropdown() {
    const { user, signOut } = useAuth();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single();
            if (data) setProfile(data);
        };
        fetchProfile();
    }, [user, supabase]);

    if (!user) return null;

    const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';
    const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.full_name || 'User')}&backgroundColor=e5e5e5`;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-white/10 border-2 border-transparent hover:border-[#BEF264] transition-all flex items-center justify-center overflow-hidden"
                aria-label="User Menu"
            >
                {profile?.avatar_url && profile.avatar_url !== 'null' && profile.avatar_url.trim() !== '' ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <img src={fallbackAvatar} alt="Avatar" className="w-full h-full object-cover" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5">
                        <p className="text-sm font-bold text-black dark:text-white truncate">
                            {profile?.full_name || 'My Account'}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest truncate mt-1">
                            {user.email}
                        </p>
                    </div>
                    <div className="p-2">
                        {/* 
                          We don't know the exact profile route for each user role in this global component.
                          So we either use a generic /profile or let them go back to dashboard. 
                          The user requested to encapsulate "Sign Out". 
                        */}
                        <Link 
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-neutral-700 dark:text-neutral-300 w-full text-left text-sm font-bold"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="w-4 h-4" /> Dashboard
                        </Link>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut();
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-red-500 w-full text-left text-sm font-bold"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
