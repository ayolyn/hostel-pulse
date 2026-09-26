"use server";

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { hammingDistanceHex, calculateSimilarity } from '@/lib/phash';
import { createNotification } from '@/lib/notifications';

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createSupabaseClient(url, key, {
        auth: { persistSession: false }
    });
}

async function requireSuperAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const isSuperAdminEmail = user.email?.toLowerCase() === 'juliusayolyn148@gmail.com';

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!isSuperAdminEmail && roleData?.role?.toLowerCase() !== 'super_admin') {
        throw new Error("Forbidden: Super Admin required.");
    }
    return user.id;
}

export interface ImageHashEntry {
    url: string;
    phash: string;
}

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    confidenceScore: number;
    matchedPropertyId: string | null;
    matchedImageUrl: string | null;
    flaggedImageUrl: string | null;
}

/**
 * Checks an array of images with hashes against existing platform images.
 * Threshold <= 8 hamming distance (>= 87.5% visual match).
 */
export async function checkAndRecordListingDuplicates({
    propertyId,
    imagesWithHashes,
    location,
    userId,
    excludePropertyId
}: {
    propertyId: string;
    imagesWithHashes: ImageHashEntry[];
    location?: string;
    userId?: string;
    excludePropertyId?: string;
}): Promise<DuplicateCheckResult> {
    const adminClient = getAdminClient();

    let isDuplicate = false;
    let confidenceScore = 0;
    let matchedPropertyId: string | null = null;
    let matchedImageUrl: string | null = null;
    let flaggedImageUrl: string | null = null;

    try {
        // Query existing listing images with their properties
        let query = adminClient
            .from('listing_images')
            .select(`
                id,
                property_id,
                image_url,
                image_phash,
                properties!inner (
                    id,
                    owner_id,
                    agent_id,
                    landlord_id,
                    location,
                    status
                )
            `);

        // Exclude current property if editing
        const excludeId = excludePropertyId || propertyId;
        if (excludeId) {
            query = query.neq('property_id', excludeId);
        }

        const { data: existingImages, error: queryError } = await query.limit(500);

        if (!queryError && existingImages && existingImages.length > 0) {
            for (const newImg of imagesWithHashes) {
                if (!newImg.phash || newImg.phash === '0000000000000000') continue;

                for (const existing of existingImages) {
                    // Skip if belongs to the same user
                    const prop = existing.properties as any;
                    if (userId && (prop?.owner_id === userId || prop?.agent_id === userId || prop?.landlord_id === userId)) {
                        continue;
                    }

                    const sim = calculateSimilarity(newImg.phash, existing.image_phash, 8);
                    if (sim.isDuplicate) {
                        if (sim.similarity > confidenceScore) {
                            isDuplicate = true;
                            confidenceScore = sim.similarity;
                            matchedPropertyId = existing.property_id;
                            matchedImageUrl = existing.image_url;
                            flaggedImageUrl = newImg.url;
                        }
                    }
                }
            }
        }

        // Store new images and hashes in listing_images table (refresh on recheck/edit)
        if (imagesWithHashes.length > 0 && propertyId) {
            await adminClient.from('listing_images').delete().eq('property_id', propertyId);
            const rowsToInsert = imagesWithHashes.map(img => ({
                property_id: propertyId,
                image_url: img.url,
                image_phash: img.phash || '0000000000000000'
            }));

            // Upsert / insert images
            await adminClient.from('listing_images').insert(rowsToInsert);
        }

        // Update property record if duplicate was detected
        if (isDuplicate && matchedPropertyId) {
            await adminClient
                .from('properties')
                .update({
                    status: 'flagged_duplicate',
                    is_active: false,
                    duplicate_match_property_id: matchedPropertyId,
                    duplicate_confidence_score: confidenceScore,
                    duplicate_flagged_image: matchedImageUrl
                })
                .eq('id', propertyId);

            // Audit log
            await adminClient.from('property_audit_logs').insert({
                property_id: propertyId,
                changed_by: userId || null,
                action: 'flagged_duplicate_detected',
                field: 'duplicate_confidence_score',
                new_value: `${confidenceScore}% match with ${matchedPropertyId}`
            });
        }

    } catch (err) {
        console.error('checkAndRecordListingDuplicates error:', err);
    }

    return {
        isDuplicate,
        confidenceScore,
        matchedPropertyId,
        matchedImageUrl,
        flaggedImageUrl
    };
}

/**
 * Retrieves all properties currently flagged as duplicates for admin review.
 */
export async function adminGetDuplicateQueue() {
    await requireSuperAdmin();
    const adminClient = getAdminClient();

    try {
        // Fetch flagged listings
        const { data: flaggedListings, error } = await adminClient
            .from('properties')
            .select('*')
            .or('status.eq.flagged_duplicate,duplicate_match_property_id.not.is.null')
            .order('created_at', { ascending: false });

        if (error || !flaggedListings || flaggedListings.length === 0) {
            return [];
        }

        // Gather all matched property IDs and agent IDs to hydrate
        const matchedPropIds = Array.from(new Set(flaggedListings.map(p => p.duplicate_match_property_id).filter(Boolean)));
        const allUserIds = Array.from(new Set([
            ...flaggedListings.map(p => p.agent_id || p.owner_id || p.landlord_id),
        ].filter(Boolean)));

        // Hydrate matched properties
        let matchedPropsMap = new Map<string, any>();
        if (matchedPropIds.length > 0) {
            const { data: matchedProps } = await adminClient
                .from('properties')
                .select('*')
                .in('id', matchedPropIds);
            
            if (matchedProps) {
                matchedProps.forEach(p => {
                    matchedPropsMap.set(p.id, p);
                    if (p.agent_id) allUserIds.push(p.agent_id);
                    if (p.owner_id) allUserIds.push(p.owner_id);
                    if (p.landlord_id) allUserIds.push(p.landlord_id);
                });
            }
        }

        // Hydrate user profiles, agent accounts & landlord accounts
        const uniqueUserIds = Array.from(new Set(allUserIds.filter(Boolean)));
        const [profilesRes, agentRes, landlordRes] = await Promise.all([
            uniqueUserIds.length > 0
                ? adminClient.from('profiles').select('id, full_name, email, phone, avatar_url, infraction_strikes').in('id', uniqueUserIds)
                : { data: [] },
            uniqueUserIds.length > 0
                ? adminClient.from('agent_accounts').select('id, full_name, phone, whatsapp_number, logo_url, business_name, infraction_strikes').in('id', uniqueUserIds)
                : { data: [] },
            uniqueUserIds.length > 0
                ? adminClient.from('landlord_accounts').select('id, full_name, phone, whatsapp_number, logo_url, business_name, infraction_strikes').in('id', uniqueUserIds)
                : { data: [] }
        ]);

        const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
        const agentMap = new Map((agentRes.data || []).map(a => [a.id, a]));
        const landlordMap = new Map((landlordRes.data || []).map(l => [l.id, l]));

        const formatUser = (userId: string | null) => {
            if (!userId) return null;
            const prof = profileMap.get(userId);
            const agent = agentMap.get(userId);
            const landlord = landlordMap.get(userId);

            const name = agent?.full_name || landlord?.full_name || prof?.full_name || agent?.business_name || landlord?.business_name || 'Verified Lister';
            const phone = agent?.phone || agent?.whatsapp_number || landlord?.phone || landlord?.whatsapp_number || prof?.phone || 'No phone';
            const email = prof?.email || 'No email';
            // User Rule 2: avatar_url first, fallback to logo_url, then placeholder Dicebear
            const avatar = prof?.avatar_url || agent?.logo_url || landlord?.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`;
            const strikes = agent?.infraction_strikes || landlord?.infraction_strikes || prof?.infraction_strikes || 0;

            return {
                id: userId,
                name,
                phone,
                email,
                avatar,
                strikes
            };
        };

        return flaggedListings.map(item => {
            const matchedProp = item.duplicate_match_property_id ? matchedPropsMap.get(item.duplicate_match_property_id) : null;
            const newAgent = formatUser(item.agent_id || item.owner_id || item.landlord_id);
            const originalAgent = matchedProp ? formatUser(matchedProp.agent_id || matchedProp.owner_id || matchedProp.landlord_id) : null;

            return {
                id: item.id,
                title: item.title,
                price: item.price,
                location: item.location,
                category: item.category,
                images: item.images || [],
                status: item.status,
                created_at: item.created_at,
                duplicate_confidence_score: item.duplicate_confidence_score || 88,
                duplicate_flagged_image: item.duplicate_flagged_image,
                newAgent,
                matchedListing: matchedProp ? {
                    id: matchedProp.id,
                    title: matchedProp.title,
                    price: matchedProp.price,
                    location: matchedProp.location,
                    category: matchedProp.category,
                    images: matchedProp.images || [],
                    status: matchedProp.status,
                    created_at: matchedProp.created_at,
                    originalAgent
                } : null
            };
        });
    } catch (err) {
        console.error('adminGetDuplicateQueue error:', err);
        return [];
    }
}

/**
 * 1. Approve as Legitimate: Sets new listing to 'active' & is_active = true
 */
export async function adminApproveDuplicateListing(propertyId: string) {
    const adminId = await requireSuperAdmin();
    const adminClient = getAdminClient();

    const { data: prop, error: fetchErr } = await adminClient
        .from('properties')
        .select('id, title, agent_id, owner_id')
        .eq('id', propertyId)
        .single();

    if (fetchErr || !prop) throw new Error("Property not found");

    const { error } = await adminClient
        .from('properties')
        .update({
            status: 'active',
            is_active: true,
            duplicate_confidence_score: null,
            duplicate_match_property_id: null
        })
        .eq('id', propertyId);

    if (error) throw new Error(error.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: adminId,
        action: 'duplicate_approved_legitimate',
        field: 'status',
        new_value: 'active'
    });

    const targetUserId = prop.agent_id || prop.owner_id;
    if (targetUserId) {
        await createNotification(
            targetUserId,
            'Listing Verified & Approved! 🚀',
            `Your listing "${prop.title}" has been reviewed by admins and is now live on HostelPulse.`,
            '/dashboard',
            'property_approved'
        );
    }

    return { success: true };
}

/**
 * 2. Merge with Existing: Links new agent to the existing building as co-lister, deactivates duplicate.
 */
export async function adminMergeDuplicateListing(duplicatePropertyId: string, targetPropertyId: string) {
    const adminId = await requireSuperAdmin();
    const adminClient = getAdminClient();

    const { data: dupProp } = await adminClient
        .from('properties')
        .select('id, title, agent_id, owner_id, landlord_id')
        .eq('id', duplicatePropertyId)
        .single();

    const { data: targetProp } = await adminClient
        .from('properties')
        .select('id, title, agent_id, owner_id, landlord_id, co_lister_ids')
        .eq('id', targetPropertyId)
        .single();

    if (!dupProp || !targetProp) throw new Error("Properties not found");

    const dupAgentId = dupProp.agent_id || dupProp.owner_id || dupProp.landlord_id;

    // 1. Link new agent as co-lister on target property
    if (dupAgentId) {
        const existingCoListers = Array.isArray(targetProp.co_lister_ids) ? targetProp.co_lister_ids : [];
        if (!existingCoListers.includes(dupAgentId)) {
            await adminClient
                .from('properties')
                .update({
                    co_lister_ids: [...existingCoListers, dupAgentId]
                })
                .eq('id', targetPropertyId);
        }
    }

    // 2. Deactivate and mark duplicate listing as merged
    const { error: updateErr } = await adminClient
        .from('properties')
        .update({
            status: 'merged',
            is_active: false,
            duplicate_match_property_id: targetPropertyId,
            verification_notes: `Merged into existing property ${targetPropertyId} by admin. Co-lister ${dupAgentId || 'unknown'} linked.`
        })
        .eq('id', duplicatePropertyId);

    if (updateErr) throw new Error(updateErr.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: duplicatePropertyId,
        changed_by: adminId,
        action: 'duplicate_merged',
        field: 'status',
        new_value: `merged_into_${targetPropertyId}`
    });

    if (dupAgentId) {
        await createNotification(
            dupAgentId,
            'Listing Merged with Existing Hostel 🏢',
            `Your upload for "${dupProp.title}" was matched to an existing verified hostel on HostelPulse and you have been added as an authorized co-lister!`,
            '/dashboard',
            'property_merged'
        );
    }

    return { success: true };
}

/**
 * 3. Reject & Issue Strike: Rejects listing, sets status to 'suspended', and logs an infraction strike.
 * If strikes >= 3, automatically suspends the agent or landlord account.
 */
export async function adminRejectAndStrikeAgent(propertyId: string, reason?: string) {
    const adminId = await requireSuperAdmin();
    const adminClient = getAdminClient();

    const { data: prop, error: fetchErr } = await adminClient
        .from('properties')
        .select('id, title, agent_id, owner_id, landlord_id')
        .eq('id', propertyId)
        .single();

    if (fetchErr || !prop) throw new Error("Property not found");

    const note = reason || "Duplicate listing photos uploaded without authorization.";

    // Set property to suspended
    const { error: propErr } = await adminClient
        .from('properties')
        .update({
            status: 'suspended',
            is_active: false,
            verification_notes: note
        })
        .eq('id', propertyId);

    if (propErr) throw new Error(propErr.message);

    const agentId = prop.agent_id || prop.owner_id || prop.landlord_id;
    let newStrikes = 1;

    if (agentId) {
        // Fetch current strikes across agent_accounts, landlord_accounts, or profiles
        const [agentRes, landlordRes, profRes] = await Promise.all([
            adminClient.from('agent_accounts').select('infraction_strikes').eq('id', agentId).maybeSingle(),
            adminClient.from('landlord_accounts').select('infraction_strikes').eq('id', agentId).maybeSingle(),
            adminClient.from('profiles').select('infraction_strikes').eq('id', agentId).maybeSingle()
        ]);

        const currentStrikes = Number(
            agentRes.data?.infraction_strikes ||
            landlordRes.data?.infraction_strikes ||
            profRes.data?.infraction_strikes ||
            0
        );
        newStrikes = currentStrikes + 1;

        // Update strikes across agent_accounts, landlord_accounts, and profiles
        await Promise.all([
            adminClient.from('agent_accounts').update({ infraction_strikes: newStrikes }).eq('id', agentId),
            adminClient.from('landlord_accounts').update({ infraction_strikes: newStrikes }).eq('id', agentId),
            adminClient.from('profiles').update({ infraction_strikes: newStrikes }).eq('id', agentId)
        ]);

        // If 3 or more strikes, automatically suspend the account across roles & suspend all properties!
        let accountSuspended = false;
        if (newStrikes >= 3) {
            await Promise.all([
                adminClient.from('agent_accounts').update({ status: 'suspended', is_approved: false }).eq('id', agentId),
                adminClient.from('landlord_accounts').update({ status: 'suspended' }).eq('id', agentId),
                adminClient.from('profiles').update({ status: 'suspended', is_verified: false }).eq('id', agentId),
                adminClient.from('properties').update({ is_active: false, status: 'suspended' }).or(`agent_id.eq.${agentId},owner_id.eq.${agentId},landlord_id.eq.${agentId}`)
            ]);
            accountSuspended = true;
        }

        // Notify agent / landlord
        const notificationTitle = accountSuspended
            ? 'Account Suspended: 3 Infraction Strikes 🛑'
            : `Infraction Strike Issued (Strike ${newStrikes}/3) ⚠️`;

        const notificationMsg = accountSuspended
            ? `Your account was suspended after receiving 3 strikes. Reason for last strike: ${note}`
            : `Your listing "${prop.title}" was rejected for duplicate media. You have ${newStrikes}/3 strikes. Repeated violations will result in permanent account suspension.`;

        await createNotification(agentId, notificationTitle, notificationMsg, '/dashboard', 'strike_issued');
    }

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: adminId,
        action: 'duplicate_rejected_strike_issued',
        field: 'status',
        new_value: `suspended (strikes: ${newStrikes})`
    });

    return { success: true, strikes: newStrikes };
}
