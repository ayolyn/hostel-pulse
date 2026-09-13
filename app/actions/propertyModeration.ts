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
        .single();
    
    if (roleData?.role !== 'super_admin') {
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
            status: 'pending',
            verification_status: 'Requires Update',
            is_active: false
        })
        .eq('id', propertyId);

    if (error) throw new Error(error.message);

    await adminClient.from('property_audit_logs').insert({
        property_id: propertyId,
        changed_by: user.id,
        action: 'reactivation_requested',
        field: 'status',
        new_value: 'pending'
    });

    return { success: true };
}