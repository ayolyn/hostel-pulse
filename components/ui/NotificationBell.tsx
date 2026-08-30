'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type Notification = {
    id: string;
    title: string;
    message: string;
    body?: string;
    type: 'success' | 'warning' | 'info' | 'error' | string;
    is_read: boolean;
    created_at: string;
    link?: string;
};

export function NotificationBell() {
    const { user } = useAuth();
    const supabase = createClient();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications and subscribe to realtime
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            console.log('--- BELL FETCH RESULT ---', { data, error, currentUserId: user.id });

            if (!error && data) {
                setNotifications(data as Notification[]);
            }
        };

        // Always fetch on mount or when opened to bypass stale state
        fetchNotifications();

        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload: any) => {
                    const newNotification = payload.new as Notification;
                    setNotifications((prev) => prev.some(n => n.id === newNotification.id) ? prev : [newNotification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, isOpen, supabase]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAllAsRead = async () => {
        if (!user || unreadCount === 0) return;

        // Optimistic UI update
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-400 group"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 group-hover:text-black dark:group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5">
                        <h3 className="font-black uppercase tracking-widest text-sm text-black dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-bold uppercase tracking-widest text-[#BEF264] hover:text-[#d9ff96] bg-black px-2 py-1 rounded-md transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500">
                                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100 dark:divide-white/5">
                                {notifications.map((notification) => {
                                    const NotificationContent = (
                                        <div 
                                            key={notification.id} 
                                            className={`p-4 flex gap-4 transition-colors hover:bg-neutral-50 dark:hover:bg-[#BEF264]/5 ${!notification.is_read ? 'bg-neutral-50/50 dark:bg-[#BEF264]/10 border-l-4 border-l-[#BEF264]' : 'border-l-4 border-l-transparent'}`}
                                        >
                                            <div className="shrink-0 mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className={`text-sm font-bold ${!notification.is_read ? 'text-black dark:text-[#BEF264]' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                                    {notification.body || notification.message}
                                                </p>
                                            </div>
                                        </div>
                                    );

                                    return notification.link && notification.link !== '#' ? (
                                        <Link key={notification.id} href={notification.link} onClick={() => setIsOpen(false)}>
                                            {NotificationContent}
                                        </Link>
                                    ) : NotificationContent;
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
