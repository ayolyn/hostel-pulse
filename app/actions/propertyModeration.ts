"use server";

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
    
    if (roleData?.role?.toLowerCase() !== 'super_admin') {
        throw new Error("Forbidden: Super Admin required.");
    }
    return user.id;
}

export async function adminApproveProperty(propertyId: string) {
    const adminId = await requireSuperAdmin();
    const adminClient = getAdminClient();

    const { error } = await adminClient
        .from('properties')
        .update({
            status: 'active',
            is_active: true
        })
        .eq('id', propertyId);

    if (error) throw new Error(error.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: adminId,
        action: 'property_approved',
        field: 'status',
        new_value: 'active'
    });

    return { success: true };
}

export async function adminRejectProperty(propertyId: string, reason: string) {
    const adminId = await requireSuperAdmin();
    const adminClient = getAdminClient();

    const { error } = await adminClient
        .from('properties')
        .update({
            status: 'rejected',
            is_active: false,
            verification_notes: reason
        })
        .eq('id', propertyId);

    if (error) throw new Error(error.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: adminId,
        action: 'property_rejected',
        field: 'verification_notes',
        new_value: reason
    });

    return { success: true };
}

export async function adminRequestChanges(propertyId: string, reason: string) {
    const adminId = await requireSuperAdmin();
    const adminClient = getAdminClient();

    const { error } = await adminClient
        .from('properties')
        .update({
            status: 'changes_requested',
            is_active: false,
            verification_notes: reason
        })
        .eq('id', propertyId);

    if (error) throw new Error(error.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: adminId,
        action: 'changes_requested',
        field: 'verification_notes',
        new_value: reason
    });

    return { success: true };
}

export async function adminUpdateVerification(
    propertyId: string, 
    flags: {
        address_confirmed: boolean;
        price_confirmed: boolean;
        agent_confirmed: boolean;
        video_confirmed: boolean;
        availability_confirmed: boolean;
        verified_walkthrough: boolean;
    },
    method: 'physical' | 'remote' | null,
    status: string
) {
    const adminId = await requireSuperAdmin();
    const adminClient = getAdminClient();

    const payload: any = {
        ...flags,
        verification_status: status
    };

    if (method) {
        payload.verification_method = method;
        payload.verified_by = adminId;
        payload.verified_at = new Date().toISOString();
    }

    const { error } = await adminClient
        .from('properties')
        .update(payload)
        .eq('id', propertyId);

    if (error) throw new Error(error.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: adminId,
        action: 'verification_updated',
        field: 'verification_status',
        new_value: payload.verification_status
    });

    return { success: true };
}

export async function agentMarkPropertyTaken(propertyId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check ownership securely as authenticated user
    const { data: prop, error: ownershipError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .or('agent_id.eq.' + user.id + ',landlord_id.eq.' + user.id)
        .single();
    
    if (ownershipError || !prop) throw new Error("Property not found or unauthorized");

    const adminClient = getAdminClient();
    const { error } = await adminClient
        .from('properties')
        .update({
            status: 'taken',
            is_active: false
        })
        .eq('id', propertyId);

    if (error) throw new Error(error.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: user.id,
        action: 'marked_taken',
        field: 'status',
        new_value: 'taken'
    });

    return { success: true };
}

export async function agentRequestReactivation(propertyId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check ownership
    const { data: prop, error: ownershipError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .or('agent_id.eq.' + user.id + ',landlord_id.eq.' + user.id)
        .single();
    
    if (ownershipError || !prop) throw new Error("Property not found or unauthorized");

    const adminClient = getAdminClient();
    const { error } = await adminClient
        .from('properties')
        .update({
            status: 'active',
            verification_status: 'Unverified',
            is_active: true
        })
        .eq('id', propertyId);

    if (error) throw new Error(error.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: user.id,
        action: 'reactivation_requested',
        field: 'status',
        new_value: 'active'
    });

    return { success: true };
}

export async function submitPropertyReport({
    propertyId,
    reason,
    details
}: {
    propertyId: string;
    reason: string;
    details?: string;
}) {
    if (!propertyId || !reason) {
        return { error: "Property ID and reason are required." };
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('property_reports')
            .insert({
                property_id: propertyId,
                reporter_id: user?.id || null,
                reason,
                details: details?.trim() || null,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error("Error submitting property report:", error);
            return { error: error.message };
        }

        return { success: true, report: data };
    } catch (err: any) {
        console.error("submitPropertyReport exception:", err);
        return { error: err.message || "Failed to submit report" };
    }
}

export async function adminGetPropertyReports() {
    await requireSuperAdmin();
    const adminClient = getAdminClient();

    try {
        // First try joined query for properties
        const { data, error } = await adminClient
            .from('property_reports')
            .select(`
                id,
                property_id,
                reporter_id,
                reason,
                details,
                status,
                created_at,
                properties (
                    id,
                    title,
                    location,
                    price,
                    images,
                    status,
                    is_active,
                    agent_id
                )
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            // Hydrate reporter profiles separately to avoid cross-schema FK cache constraints
            const reporterIds = Array.from(new Set(data.map((r: any) => r.reporter_id).filter(Boolean)));
            if (reporterIds.length > 0) {
                const { data: profiles } = await adminClient
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', reporterIds);
                const profMap = new Map((profiles || []).map((p: any) => [p.id, p]));
                return data.map((r: any) => ({
                    ...r,
                    reporter: profMap.get(r.reporter_id) || null
                }));
            }
            return data;
        }

        // Resilient fallback: fetch reports directly and hydrate both properties and reporters
        const { data: rawReports, error: rawError } = await adminClient
            .from('property_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (rawError || !rawReports) return [];

        const propIds = Array.from(new Set(rawReports.map((r: any) => r.property_id).filter(Boolean)));
        const repIds = Array.from(new Set(rawReports.map((r: any) => r.reporter_id).filter(Boolean)));

        const [propsRes, profilesRes] = await Promise.all([
            propIds.length > 0
                ? adminClient.from('properties').select('id, title, location, price, images, status, is_active, agent_id').in('id', propIds)
                : { data: [] },
            repIds.length > 0
                ? adminClient.from('profiles').select('id, full_name, email').in('id', repIds)
                : { data: [] }
        ]);

        const propsMap = new Map((propsRes.data || []).map((p: any) => [p.id, p]));
        const repMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));

        return rawReports.map((r: any) => ({
            ...r,
            properties: propsMap.get(r.property_id) || null,
            reporter: repMap.get(r.reporter_id) || null
        }));
    } catch (err) {
        console.error("adminGetPropertyReports error:", err);
        return [];
    }
}

export async function adminDismissReport(reportId: string) {
    await requireSuperAdmin();
    const adminClient = getAdminClient();

    const { error } = await adminClient
        .from('property_reports')
        .update({ status: 'dismissed', updated_at: new Date().toISOString() })
        .eq('id', reportId);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function adminTakeDownReportedProperty(reportId: string, propertyId: string, note?: string) {
    const adminId = await requireSuperAdmin();
    const adminClient = getAdminClient();

    const { error: propError } = await adminClient
        .from('properties')
        .update({
            status: 'rejected',
            is_active: false,
            verification_notes: note || 'Taken down due to student report.'
        })
        .eq('id', propertyId);

    if (propError) throw new Error(propError.message);

    await adminClient
        .from('property_reports')
        .update({ status: 'resolved', updated_at: new Date().toISOString() })
        .eq('id', reportId);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: adminId,
        action: 'takedown_by_report',
        field: 'status',
        new_value: 'rejected'
    });

    return { success: true };
}