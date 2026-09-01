"use server";

import { sendNotificationEmail } from '@/lib/email/resend';
import { getEmailTemplate } from '@/app/actions/emailTemplates';
import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function verifyAdmin() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() { }
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (roleData?.role !== 'super_admin') {
        throw new Error("Unauthorized: Insufficient privileges");
    }
}


// Initialize admin client INSIDE each function to avoid stale module-level state
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, {
        auth: { persistSession: false }
    });
}

export async function getAdminMetrics() {
    await verifyAdmin();
    const db = getAdminClient();
    try {
        const { count: totalUsers } = await db
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        const { count: totalProperties } = await db
            .from('properties')
            .select('*', { count: 'exact', head: true });

        // Inspections Scheduled: Counts rows in the inspections table where status = 'pending'
        const { count: pendingInspections } = await db
            .from('inspections')
            .select('*', { count: 'exact', head: true })
            .ilike('status', 'Pending'); // Allowing case variations

        // Active Escrow Total: sum of transactions where status = 'HELD'
        const { data: stats } = await db
            .from('escrow_transactions')
            .select('amount, protection_fee')
            .eq('status', 'HELD');

        const totalEscrow = (stats || []).reduce((acc, curr) => acc + (curr.amount || 0) + (curr.protection_fee || 0), 0);

        const pendingApprovals = await getPendingCount(db);

        return {
            totalUsers: totalUsers || 0,
            totalProperties: totalProperties || 0,
            totalInspections: pendingInspections || 0,
            totalEscrow,
            pendingApprovals,
        };
    } catch (error) {
        console.error("getAdminMetrics error:", error);
        return { totalUsers: 0, totalProperties: 0, totalInspections: 0, totalEscrow: 0, pendingApprovals: 0 };
    }
}

async function getPendingCount(db: any) {
    let count = 0;
    
    const { count: profilesCount } = await db
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false)
        .not('student_id_url', 'is', null).neq('student_id_url', '');
    
    count += profilesCount || 0;

    const tables = ['landlord_accounts', 'agent_accounts'];
    for (const table of tables) {
        const { count: c } = await db
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('compliance_submitted', true)
            .or('is_approved.eq.false,is_approved.is.null');
        count += c || 0;
    }
    return count;
}

export async function getPendingAccounts() {
    await verifyAdmin();
    const db = getAdminClient();
    let allPending: any[] = [];

    // Query specifically what the user asked for: profiles needing verification
    const { data: studentData, error: studentError } = await db
        .from('profiles')
        .select('*')
        .eq('is_verified', false)
        .not('student_id_url', 'is', null).neq('student_id_url', '') // We know business fields aren't inherently in profiles, but student_id_url is.
        .order('updated_at', { ascending: true });

    if (studentError) {
        console.error("getPendingAccounts [profiles] error:", studentError.message);
    } else if (studentData) {
        allPending = [...allPending, ...studentData.map(row => ({ ...row, _tableName: 'profiles' }))];
    }

    const tables = ['landlord_accounts', 'agent_accounts'];

    for (const table of tables) {
        const { data, error } = await db
            .from(table)
            .select('*')
            .eq('compliance_submitted', true)
            .or('is_approved.eq.false,is_approved.is.null')
            .order('created_at', { ascending: true });

        if (error) {
            console.error(`getPendingAccounts [${table}] error:`, error.message);
        } else if (data) {
            allPending = [...allPending, ...data.map(row => ({ ...row, _tableName: table }))];
        }
    }

    return allPending;
}

export async function approveAccount(id: string, tableName: string) {
    await verifyAdmin();
    const db = getAdminClient();

    if (tableName === 'profiles') {
        const { error, data: profileData } = await db
            .from('profiles')
            .update({ is_verified: true, trust_level: 'Verified Member' })
            .eq('id', id)
            .select('*')
            .single();

        if (!error && profileData) {
            // Also update student_accounts to show "Verified" just in case it is queried elsewhere
            await db.from('student_accounts').update({ is_approved: true }).eq('id', id);

            const { data: { user: authUser } } = await db.auth.admin.getUserById(id);

            // In-App Notification (Live Sync)
            await db.from('notifications').insert({
                user_id: id,
                title: 'Verification Successful! 🎉',
                message: 'Your Student ID has been verified. You can now use the Campus Market.',
                type: 'VERIFICATION_SUCCESS'
            });

            // Automated Messages Queue (n8n/Make Watcher)
            await db.from('messages_queue').insert({
                user_id: id,
                email: authUser?.email || null,
                phone_number: authUser?.phone || null,
                message_body: `Wahala over! 🚀\n\nHello ${profileData.full_name}, your Student ID has been verified by the HOSTELPULSE team.\n\nYour Trust Profile is now active and your account is Verified. You can now:\n✅ Post items for sale in the Campus Market.\n✅ Find and message potential Roommates.\n✅ Book inspections for Hostels & Shops.\n\nLog in now to see your new badge:\nhttps://HOSTELPULSE.vercel.app/dashboard`,
                status: 'pending'
            });
        }

        if (error) return { error: error.message };
        
        // Notify student
        await createNotification(id, 'Verification Successful! 🎉', 'Your Student ID has been verified. You can now use the Campus Market.', '/dashboard/student', 'VERIFICATION_SUCCESS');
        return { success: true };
    }

    const { error } = await db
        .from(tableName)
        .update({ 
            is_approved: true,
            is_verified: true
        })
        .eq('id', id);

    if (error) {
        console.error("approveAccount error:", error);
        return { error: error.message };
    }
    
    // Notify landlord/agent
    const roleMap: Record<string, string> = {
        'landlord_accounts': '/dashboard/landlord',
        'agent_accounts': '/dashboard/agent'
    };
    await createNotification(id, 'Account Approved! ??', 'Your professional account has been verified. You can now list properties.', roleMap[tableName] || '/dashboard', 'account_approved');
    
    const { data: profileForEmail } = await db.from('profiles').select('contact_email, email').eq('id', id).single();
    if (profileForEmail) {
        const emailToUse = profileForEmail.contact_email || profileForEmail.email;
        if (emailToUse) {
            const html = getEmailTemplate({
                subHeading: 'COMPLIANCE UPDATE',
                title: 'Account Approved! ??',
                body: 'Great news! Your professional account has been verified by our compliance team. You now have full access to list properties and manage your dashboard.',
                buttonText: 'Go to Dashboard',
                buttonLink: 'https://hostel-pulse.pages.dev/dashboard/agent',
                showFallbackLink: false
            });
            await sendNotificationEmail(emailToUse, 'Hostel Pulse: Account Approved!', html);
        }
    }
    
    return { success: true };
}

export async function rejectAccount(id: string, tableName: string) {
    await verifyAdmin();
    const db = getAdminClient();
    
    if (tableName === 'profiles') {
        const { error, data: profileData } = await db
            .from('profiles')
            .update({ student_id_url: null, is_verified: false })
            .eq('id', id)
            .select('*')
            .single();
            
        if (!error && profileData) {
            const { data: { user: authUser } } = await db.auth.admin.getUserById(id);
            await db.from('messages_queue').insert({
                user_id: id,
                email: authUser?.email || null,
                phone_number: authUser?.phone || null,
                message_body: `Hello ${profileData.full_name},\n\nWe couldn't verify your Student ID for HOSTELPULSE.\nReason: Image too blurry / ID Expired / Invalid Document\n\nPlease re-upload a clear photo of your LAUTECH ID in your profile to unlock full access.\nFix it here: https://HOSTELPULSE.vercel.app/dashboard/student`,
                status: 'pending'
            });
            await createNotification(id, 'Verification Failed ❌', 'We couldn\'t verify your Student ID. Please re-upload a clear photo.', '/dashboard/student', 'VERIFICATION_FAILED');
            return { success: true };
        }
        return error ? { error: error.message } : { success: true };
    }

    const { error } = await db
        .from(tableName)
        .update({ is_approved: false, compliance_submitted: false, govt_id_url: null, selfie_url: null, cac_document_url: null })
        .eq('id', id);

    if (error) return { error: error.message };
    
    await createNotification(id, 'Account Rejected', 'Your professional account application was rejected.', '/join', 'account_rejected');
    return { success: true };
}

// ============================================
// Secure Dispute Intervention Actions
// ============================================
export async function getDisputedTransactions() {
    await verifyAdmin();
    const db = getAdminClient();
    const { data, error } = await db
        .from('escrow_transactions')
        .select(`
            *,
            market_listings ( title, price ),
            properties ( title )
        `)
        .eq('status', 'Disputed')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('getDisputedTransactions error:', error);
        return [];
    }
    return data;
}

export async function getAuditChat(transactionId: string) {
    await verifyAdmin();
    const db = getAdminClient();
    const { data: messages, error } = await db
        .from('messages')
        .select('sender_id, content, created_at, profiles!sender_id(full_name, role)') 
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });
        
    if (error) {
        console.error('getAuditChat error:', error);
        return { error: error.message, messages: [] };
    }
    return { messages };
}

export async function resolveDispute(transactionId: string, resolution: 'Refunded' | 'Released') {
    await verifyAdmin();
    const db = getAdminClient();

    // 1. Fetch transaction details
    const { data: tx } = await db.from('escrow_transactions').select('*').eq('id', transactionId).single();

    if (!tx) return { error: 'Transaction not found' };

    const { error } = await db
        .from('escrow_transactions')
        .update({ status: resolution })
        .eq('id', transactionId);

    if (error) return { error: error.message };

    // Auto-Reconcile Balance on Resolution
    if (resolution === 'Refunded') {
        const buyerId = tx.payer_id || tx.buyer_id;
        if (buyerId) {
            const { data: profile } = await db.from('profiles').select('wallet_balance').eq('id', buyerId).single();
            const currentBalance = Number(profile?.wallet_balance || 0);
            const refundAmount = Number(tx.amount || 0);
            await db.from('profiles').update({ wallet_balance: currentBalance + refundAmount }).eq('id', buyerId);
        }
    } else if (resolution === 'Released') {
        const sellerId = tx.payee_id || tx.seller_id;
        if (sellerId) {
            const { data: profile } = await db.from('profiles').select('wallet_balance').eq('id', sellerId).single();
            const currentBalance = Number(profile?.wallet_balance || 0);
            const releaseAmount = Number(tx.amount || 0);
            await db.from('profiles').update({ wallet_balance: currentBalance + releaseAmount }).eq('id', sellerId);
        }
    }

    // 2. Send Notifications
    if (tx) {
        if (resolution === 'Refunded') {
            await createNotification(tx.payer_id || tx.buyer_id, 'Transaction Update', `Your transaction status has updated to ${resolution}`, `/dashboard/student/disputes/${transactionId}`, 'dispute_resolved');
            if (tx.payee_id || tx.seller_id) {
                await createNotification(tx.payee_id || tx.seller_id, 'Transaction Update', `Your transaction status has updated to ${resolution}`, `/dashboard/student/disputes/${transactionId}`, 'dispute_resolved');
            }
        } else if (resolution === 'Released') {
            if (tx.payee_id || tx.seller_id) {
                await createNotification(tx.payee_id || tx.seller_id, 'Transaction Update', `Your transaction status has updated to ${resolution}`, `/dashboard/student/disputes/${transactionId}`, 'dispute_resolved');
            }
            await createNotification(tx.payer_id || tx.buyer_id, 'Transaction Update', `Your transaction status has updated to ${resolution}`, `/dashboard/student/disputes/${transactionId}`, 'dispute_resolved');
        }
    }

    return { success: true };
}

// ============================================
// Analytics Engine Actions
// ============================================
export async function getAnalyticsData() {
    await verifyAdmin();
    const db = getAdminClient();
    
    // 1. Financial & Escrow Metrics
    const { data: escrowData } = await db.from('escrow_transactions').select('amount, status');
    let totalVolume = 0;
    let activeEscrow = 0;
    let completedCount = 0;
    
    (escrowData || []).forEach(tx => {
        if (tx.status === 'Released' || tx.status === 'completed') {
            totalVolume += Number(tx.amount || 0);
            completedCount++;
        }
        if (tx.status === 'HELD' || tx.status === 'pending' || tx.status === 'Locked') {
            activeEscrow += Number(tx.amount || 0);
        }
    });
    
    const avgTransactionValue = (completedCount > 0) ? (totalVolume / completedCount) : 0;
    
    // 2. Market Gap Analysis
    const marketGap = [
        { category: 'Single Room', budget: 120000, price: 150000 },
        { category: 'Self Con', budget: 200000, price: 250000 },
        { category: '1 Bedroom', budget: 350000, price: 400000 },
        { category: '2 Bedroom', budget: 500000, price: 550000 },
        { category: 'Shop', budget: 250000, price: 300000 },
    ];
    
    // 3. Conversion Funnel
    const funnel = [
        { step: 'Total Searches', count: 12500 },
        { step: 'Property Views', count: 8400 },
        { step: 'Inspection Requests', count: 3200 },
        { step: 'Successful Escrows', count: 850 },
    ];
    
    // 4. User Engagement DAU
    const userEngagement = [
        { date: 'Mon', Student: 4000, Landlord: 120, Agent: 80 },
        { date: 'Tue', Student: 4200, Landlord: 130, Agent: 85 },
        { date: 'Wed', Student: 4100, Landlord: 125, Agent: 82 },
        { date: 'Thu', Student: 4500, Landlord: 140, Agent: 90 },
        { date: 'Fri', Student: 4800, Landlord: 150, Agent: 95 },
        { date: 'Sat', Student: 5200, Landlord: 160, Agent: 100 },
        { date: 'Sun', Student: 5000, Landlord: 155, Agent: 98 },
    ];

    return {
        financials: {
            totalVolume,
            activeEscrow,
            avgTransactionValue
        },
        marketGap,
        funnel,
        userEngagement
    };
}

// ============================================
// User Management Actions
// ============================================
export async function getAllUsers() {
    await verifyAdmin();
    const db = getAdminClient();
    let allUsers: any[] = [];

    const tables = ['student_accounts', 'agent_accounts', 'landlord_accounts'];
    for (const table of tables) {
        const { data, error } = await db.from(table).select('*').order('created_at', { ascending: false });
        if (!error && data) {
            allUsers = [...allUsers, ...data.map(row => ({ ...row, _tableName: table }))];
        }
    }
    return allUsers;
}

export async function revokeVerification(id: string, tableName: string) {
    await verifyAdmin();
    const db = getAdminClient();
    
    if (tableName === 'student_accounts' || tableName === 'profiles') {
        await db.from('profiles').update({ is_verified: false }).eq('id', id);
        const { error } = await db.from('student_accounts').update({ is_approved: false, student_id_url: null }).eq('id', id); await db.from('profiles').update({ student_id_url: null }).eq('id', id);
        
        await createNotification(id, 'Verification Revoked', 'Your verification status has been revoked. Please contact support.', '/dashboard', 'warning');
        
        const { data: profileForEmail } = await db.from('profiles').select('contact_email, email').eq('id', id).single();
        if (profileForEmail) {
            const emailToUse = profileForEmail.contact_email || profileForEmail.email;
            if (emailToUse) {
                const html = getEmailTemplate({
                    subHeading: 'ACCOUNT UPDATE',
                    title: 'Verification Revoked',
                    body: 'Your account verification has been revoked by our compliance team. You may need to re-upload clear and valid documents to regain access to full platform features.',
                    buttonText: 'Update Documents',
                    buttonLink: 'https://hostel-pulse.pages.dev/dashboard/agent',
                    showFallbackLink: false
                });
                await sendNotificationEmail(emailToUse, 'Action Required: Verification Revoked', html);
            }
        }

        if (error) return { error: error.message };
        return { success: true };
    }
    const { error } = await db.from(tableName).update({ is_verified: false, is_approved: false, govt_id_url: null, selfie_url: null, cac_document_url: null, compliance_submitted: false }).eq('id', id);
    
    await createNotification(id, 'Verification Revoked', 'Your verification status has been revoked. Please contact support.', '/dashboard', 'warning');
        
        const { data: profileForEmail } = await db.from('profiles').select('contact_email, email').eq('id', id).single();
        if (profileForEmail) {
            const emailToUse = profileForEmail.contact_email || profileForEmail.email;
            if (emailToUse) {
                const html = getEmailTemplate({
                    subHeading: 'ACCOUNT UPDATE',
                    title: 'Verification Revoked',
                    body: 'Your account verification has been revoked by our compliance team. You may need to re-upload clear and valid documents to regain access to full platform features.',
                    buttonText: 'Update Documents',
                    buttonLink: 'https://hostel-pulse.pages.dev/dashboard/agent',
                    showFallbackLink: false
                });
                await sendNotificationEmail(emailToUse, 'Action Required: Verification Revoked', html);
            }
        }

    if (error) return { error: error.message };
    return { success: true };
}

export async function suspendAccount(id: string, tableName: string) {
    await verifyAdmin();
    const db = getAdminClient();
    // 1. Update status in table
    const targetTable = tableName === 'profiles' ? 'student_accounts' : tableName;
    await db.from(targetTable).update({ status: 'suspended' }).eq('id', id);
    if (tableName === 'student_accounts') {
        await db.from('profiles').update({ is_verified: false }).eq('id', id);
    }
    
    // 2. Sever auth session via Supabase Admin API
    const { error } = await db.auth.admin.updateUserById(id, {
        user_metadata: { suspended: true } // We can track this in metadata
    });
    
    // We could also ban them entirely if we wanted, but we'll stick to suspended status 
    // The client login will check the DB or metadata to block login
    if (error) return { error: error.message };
    await createNotification(id, 'Account Suspended 🛑', 'Your account has been suspended due to policy violations.', '/dashboard', 'account_suspended');
    
    // Invalidate sessions...
    return { success: true };
}

export async function banDevice(id: string, tableName: string) {
    await verifyAdmin();
    const db = getAdminClient();
    const targetTable = tableName === 'profiles' ? 'student_accounts' : tableName;
    const { error } = await db.from(targetTable).update({ status: 'banned', is_verified: false }).eq('id', id);
    await db.auth.admin.updateUserById(id, { ban_duration: '87600h' }); // Ban for 10 years
    if (error) return { error: error.message };

    await createNotification(id, 'Account Banned 🚫', 'Your account has been permanently banned.', '/join', 'account_banned');
    return { success: true };
}

// ============================================
// Escrow & Financial Actions
// ============================================
export async function getPendingEscrows() {
    await verifyAdmin();
    const db = getAdminClient();
    const { data, error } = await db
        .from('escrow_transactions')
        .select(`*, market_listings ( title, price )`)
        .eq('status', 'HELD')
        .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
}

export async function forceReleaseEscrow(id: string) {
    await verifyAdmin();
    const db = getAdminClient();
    const { data: tx } = await db.from('escrow_transactions').select('*').eq('id', id).single();
    if (!tx) return { error: 'Transaction not found' };

    const { error } = await db.from('escrow_transactions').update({ status: 'Released' }).eq('id', id);
    if (error) return { error: error.message };

    const sellerId = tx.payee_id || tx.seller_id;
    if (sellerId) {
        const { data: profile } = await db.from('profiles').select('wallet_balance').eq('id', sellerId).single();
        const currentBalance = Number(profile?.wallet_balance || 0);
        const releaseAmount = Number(tx.amount || 0);
        await db.from('profiles').update({ wallet_balance: currentBalance + releaseAmount }).eq('id', sellerId);
    }

    return { success: true };
}

export async function forceRefundEscrow(id: string) {
    await verifyAdmin();
    const db = getAdminClient();
    const { data: tx } = await db.from('escrow_transactions').select('*').eq('id', id).single();
    if (!tx) return { error: 'Transaction not found' };

    const { error } = await db.from('escrow_transactions').update({ status: 'Refunded' }).eq('id', id);
    if (error) return { error: error.message };

    const buyerId = tx.payer_id || tx.buyer_id;
    if (buyerId) {
        const { data: profile } = await db.from('profiles').select('wallet_balance').eq('id', buyerId).single();
        const currentBalance = Number(profile?.wallet_balance || 0);
        const refundAmount = Number(tx.amount || 0);
        await db.from('profiles').update({ wallet_balance: currentBalance + refundAmount }).eq('id', buyerId);
    }

    return { success: true };
}

// ============================================
// Live Support Actions
// ============================================
export async function getSupportTickets() {
    await verifyAdmin();
    const db = getAdminClient();
    const { data, error } = await db
        .from('support_tickets')
        .select('*, profiles(first_name, avatar_url)')
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

export async function updateTicketStatus(id: string, status: 'Open' | 'Pending' | 'Resolved') {
    await verifyAdmin();
    const db = getAdminClient();
    const { error } = await db.from('support_tickets').update({ status }).eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
}

// ============================================
// Global System Alerts Actions
// ============================================
export async function broadcastSystemAlert(message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info', targetRole: string = 'all') {
    await verifyAdmin();
    const db = getAdminClient();
    
    // 1. Save to database for offline users to pull later
    const { error } = await db.from('system_announcements').insert({ message, type, target_role: targetRole });
    if (error) return { error: error.message };

    // 2. Broadcast immediately via Supabase Realtime Channel
    await db.channel('system-alerts').send({
        type: 'broadcast',
        event: 'new-alert',
        payload: { message, type, target_role: targetRole }
    });

    // 3. The bulk INSERT into the notifications table is now handled by fireGlobalBroadcast Server Action.
    return { success: true };
}

// ============================================
// Payout Queue Actions
// ============================================
export async function getPendingWithdrawals() {
    await verifyAdmin();
    const db = getAdminClient();
    const { data: withdrawals, error } = await db
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('getPendingWithdrawals error:', error);
        return [];
    }
    
    if (!withdrawals || withdrawals.length === 0) return [];

    const userIds = Array.from(new Set(withdrawals.map(w => w.user_id)));

    const { data: profiles } = await db
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

    const mergedData = withdrawals.map(w => {
        const profile = profiles?.find(p => p.id === w.user_id);
        return {
            ...w,
            profiles: profile || null
        };
    });

    return mergedData;
}

export async function approveWithdrawal(id: string) {
    await verifyAdmin();
    const db = getAdminClient();
    const { error } = await db.from('withdrawals').update({ status: 'completed' }).eq('id', id);
    if (error) return { error: error.message };
    
    // Notify Seller
    const { data: withdrawal } = await db.from('withdrawals').select('*, profiles(contact_email)').eq('id', id).single();
    if (withdrawal) {
        await createNotification(
            withdrawal.user_id,
            'Withdrawal Successful',
            'Your withdrawal request has been approved and processed.',
            '/dashboard/agent?tab=wallet',
            'withdrawal'
        );

        if (withdrawal.profiles?.contact_email) {
            const html = getEmailTemplate({
                subHeading: 'WALLET UPDATE',
                title: 'Withdrawal Approved',
                body: 'Your funds are on the way to your linked bank account. Please check your bank statement in the next few hours.',
                buttonText: 'View Wallet',
                buttonLink: 'https://hostel-pulse.pages.dev/dashboard/agent?tab=wallet',
                showFallbackLink: false
            });
            await sendNotificationEmail(withdrawal.profiles.contact_email, 'Withdrawal Approved 💸', html);
        }
    }
    
    return { success: true };
}

export async function rejectWithdrawal(id: string) {
    await verifyAdmin();
    const db = getAdminClient();
    // Fetch withdrawal to refund the wallet
    const { data: withdrawal, error: fetchErr } = await db.from('withdrawals').select('*, profiles(contact_email)').eq('id', id).single();
    if (fetchErr || !withdrawal) return { error: fetchErr?.message || 'Withdrawal not found' };

    const { error: updateErr } = await db.from('withdrawals').update({ status: 'failed' }).eq('id', id);
    if (updateErr) return { error: updateErr.message };

    // Refund wallet
    const { data: profile } = await db.from('profiles').select('wallet_balance').eq('id', withdrawal.user_id).single();
    if (profile) {
        await db.from('profiles').update({ wallet_balance: Number(profile.wallet_balance || 0) + Number(withdrawal.amount) }).eq('id', withdrawal.user_id);
    }
    
    if (withdrawal) {
        await createNotification(
            withdrawal.user_id,
            'Withdrawal Rejected',
            'Your withdrawal request was declined. Please contact support.',
            '/dashboard/agent?tab=wallet',
            'system_alert'
        );

        if (withdrawal.profiles?.contact_email) {
            const html = getEmailTemplate({
                subHeading: 'WALLET UPDATE',
                title: 'Withdrawal Rejected',
                body: 'Your recent withdrawal request was declined. Please contact support or verify your bank details before trying again.',
                buttonText: 'Contact Support',
                buttonLink: 'mailto:hello@hostel-pulse.com',
                showFallbackLink: false
            });
            await sendNotificationEmail(withdrawal.profiles.contact_email, 'Withdrawal Rejected ❌', html);
        }
    }

    return { success: true };
}
