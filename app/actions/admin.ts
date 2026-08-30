"use server";

import { createClient } from '@supabase/supabase-js';

// Requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, {
        auth: { persistSession: false }
    });
}

export async function fireGlobalBroadcast(targetAudience: string, type: string, rawMessage: string) {
    const db = getAdminClient();

    try {
        console.log(`--- FETCHING USERS FOR TARGET: ${targetAudience} ---`);
        let users: any[] = [];
        let usersError: any = null;

        try {
            if (targetAudience === 'all') {
                const tables = ['student_accounts', 'agent_accounts', 'landlord_accounts', 'non_student_accounts', 'profiles'];
                for (const table of tables) {
                    const { data, error } = await db.from(table).select('id, full_name').limit(1000);
                    if (!error && data) {
                        users = [...users, ...data.map(u => ({ ...u, role: table.replace('_accounts', '') }))];
                    }
                }
                
                // Absolute fallback to ensure EVERY user (like buyers or people who haven't finished signup) gets the alert
                const { data: authData } = await db.auth.admin.listUsers();
                if (authData?.users) {
                    authData.users.forEach((u: any) => {
                        users.push({ id: u.id, full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User', role: 'user' });
                    });
                }

                // Deduplicate users by id so they don't get double notifications
                const uniqueUsers = new Map();
                users.forEach(u => uniqueUsers.set(u.id, u));
                users = Array.from(uniqueUsers.values());
            } else {
                let table = `${targetAudience}_accounts`;
                if (targetAudience === 'student') table = 'profiles'; // Some student data might be in profiles
                const { data, error } = await db.from(table).select('id, full_name').limit(1000);
                if (error) {
                    usersError = error;
                } else if (data) {
                    users = data.map(u => ({ ...u, role: targetAudience }));
                }
            }
        } catch (e: any) {
            usersError = e;
        }
        
        console.log('--- USERS QUERY RESULT ---', { usersFound: users?.length, usersError });

        if (usersError) {
            console.error('--- QUERY FAILED ---', usersError);
            throw new Error(`Failed to fetch users: ${usersError.message}`);
        }

        if (!users || users.length === 0) {
            console.log('--- ABORTING: NO USERS FOUND IN PROFILES TABLE ---');
            throw new Error(`No users found matching target audience: ${targetAudience}`);
        }

        if (users && users.length > 0) {
            let authUsersMap = new Map<string, string>();
            // Only fetch auth users if the message actually uses the {email} tag
            if (rawMessage.includes('{email}')) {
                const { data: authData } = await db.auth.admin.listUsers();
                if (authData?.users) {
                    authData.users.forEach((u: any) => authUsersMap.set(u.id, u.email || ''));
                }
            }

            const notifications = users.map(user => {
                const firstName = user.full_name ? user.full_name.split(' ')[0] : 'User';
                const email = authUsersMap.get(user.id) || '';
                
                // Replace variables safely
                const personalizedMessage = rawMessage
                    .replace(/{first_name}/g, firstName)
                    .replace(/{role}/g, user.role || 'User')
                    .replace(/{email}/g, email);

                const safeType = type.toLowerCase();
                let notifType = 'info';
                if (['info', 'success', 'warning', 'error'].includes(safeType)) {
                    notifType = safeType;
                }
                
                return {
                    user_id: user.id, // Should match UUID of auth.users
                    title: 'System Broadcast',
                    message: personalizedMessage,
                    body: personalizedMessage,
                    type: notifType
                };
            });
            
            console.log('--- BROADCAST PAYLOAD ---', notifications);

            // Insert in batches if needed, but Supabase supports up to ~1000 rows per insert
            const { data, error } = await db.from('notifications').insert(notifications).select();
            
            console.log('--- SUPABASE INSERT RESULT ---', { data, error });

            if (error) {
                throw new Error(error.message);
            }
        }
    } catch (err: any) {
        console.error("Bulk notification error:", err);
        throw new Error(`Failed to send broadcast: ${err.message || 'Unknown error'}`);
    }
}
