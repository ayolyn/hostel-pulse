'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export function GlobalAlertsListener() {
    const supabase = createClient();
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch profile for template variables & role targeting
            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', user.id)
                .single();
            
            setUserProfile(profileData);

            const { data } = await supabase
                .from('system_announcements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                const announcement = data[0];
                
                // Targeting Check
                if (announcement.target_role !== 'all' && announcement.target_role !== profileData?.role) {
                    return;
                }

                const lastSeenId = localStorage.getItem('last_seen_announcement_id');
                if (lastSeenId !== announcement.id) {
                    // Template Parsing
                    const firstName = profileData?.full_name ? profileData.full_name.split(' ')[0] : 'User';
                    const parsedMessage = announcement.message
                        .replace(/{first_name}/g, firstName)
                        .replace(/{role}/g, profileData?.role || 'User');

                    toast(parsedMessage, {
                        icon: '📢',
                        duration: 8000,
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                    localStorage.setItem('last_seen_announcement_id', announcement.id);
                }
            }
        };

        fetchAnnouncements();

        // Listen for Realtime inserts
        const channel = supabase
            .channel('public:system_announcements')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'system_announcements' },
                async (payload: any) => {
                    const newAlert = payload.new as any;
                    
                    // We need the profile to parse variables and check target.
                    // If userProfile isn't loaded in state yet, fetch it.
                    let currentProfile = userProfile;
                    if (!currentProfile) {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
                            currentProfile = data;
                            setUserProfile(data);
                        }
                    }

                    if (!currentProfile) return;

                    // Targeting Check
                    if (newAlert.target_role !== 'all' && newAlert.target_role !== currentProfile.role) {
                        return;
                    }

                    // Template Parsing
                    const firstName = currentProfile.full_name ? currentProfile.full_name.split(' ')[0] : 'User';
                    const parsedMessage = newAlert.message
                        .replace(/{first_name}/g, firstName)
                        .replace(/{role}/g, currentProfile.role || 'User');

                    toast(parsedMessage, {
                        icon: '📢',
                        duration: 8000,
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                    localStorage.setItem('last_seen_announcement_id', newAlert.id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, userProfile]);

    return null;
}
