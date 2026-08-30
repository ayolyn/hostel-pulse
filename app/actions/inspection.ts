"use server";

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function createInspectionLinkAction(propertyId: string, roomId: string, conversationId: string | null, landlordOrAgentId: string) {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error('Not authenticated');
    }

    if (user.id !== landlordOrAgentId) {
        throw new Error('Sender ID mismatch');
    }

    // 2. Role-Based Access Control
    // Verify if the user is an agent
    const { data: agentData } = await supabase.from('agent_accounts').select('id').eq('id', user.id).maybeSingle();
    
    // Verify if the user is a landlord
    const { data: landlordData } = await supabase.from('landlord_accounts').select('id').eq('id', user.id).maybeSingle();

    if (!agentData && !landlordData) {
        throw new Error('Unauthorized: Only agents and landlords can send inspection links');
    }

    // 3. Verify Property exists
    const { data: property } = await supabase.from('properties').select('title, agent_id').eq('id', propertyId).maybeSingle();
    if (!property) {
        throw new Error('Property not found');
    }

    // 4. Construct Message Payload
    const msgContent = `🚀 INSPECTION LINK: I am ready to show you ${property.title}! Please secure your pickup slot here so we can meet. (₦2,000 Security Deposit required)\n\nLink: /pay/escrow`;

    const { data: room } = await supabase.from('chat_rooms').select('participant_a, participant_b').eq('id', roomId).single();
    if (!room) {
        throw new Error('Room not found');
    }

    const receiverId = room.participant_a === user.id ? room.participant_b : room.participant_a;

    // 5. Insert Message
    const { data: insertedMsg, error: insertError } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        room_id: roomId,
        conversation_id: conversationId,
        content: msgContent,
        is_read: false
    }).select().single();

    if (insertError) {
        throw new Error(insertError.message);
    }

    return insertedMsg;
}

export async function updateInspectionStatusAction(inspectionId: string, newStatus: string, userId: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const { createClient } = await import('@supabase/supabase-js');
    const db = createClient(url, key, { auth: { persistSession: false } });

    // Validate the user owns the property linked to this inspection
    const { data: inspection } = await db.from('inspections').select('property_id, requester_id').eq('id', inspectionId).single();
    if (!inspection) return { error: 'Inspection not found' };

    const { data: prop } = await db.from('properties')
        .select('owner_id, landlord_id, title')
        .eq('id', inspection.property_id)
        .single();
    
    if (prop?.owner_id !== userId && prop?.landlord_id !== userId) {
        return { error: 'Unauthorized to update this inspection' };
    }

    const { error } = await db.from('inspections').update({ status: newStatus }).eq('id', inspectionId);
    if (error) return { error: error.message };

    // Auto-release Escrow funds if inspection is Completed
    if (newStatus === 'Completed') {
        const { data: escrowTx } = await db
            .from('escrow_transactions')
            .select('id')
            .eq('reference_id', inspectionId)
            .eq('type', 'INSPECTION_FEE')
            .eq('status', 'Held')
            .maybeSingle();
            
        if (escrowTx) {
            const { releaseEscrowFunds } = await import('@/app/actions/escrow');
            await releaseEscrowFunds(escrowTx.id);
        }
    }

    // Trigger WhatsApp notification for the student
    if (newStatus === 'Confirmed' || newStatus === 'Cancelled') {
        const { data: requesterData } = await db
            .from('student_accounts')
            .select('phone, whatsapp_number')
            .eq('id', inspection.requester_id)
            .single();
            
        let phone = requesterData?.whatsapp_number || requesterData?.phone;
        
        if (!phone) {
            // Try non-student profiles if not in student_accounts
            const { data: profile } = await db
                .from('profiles')
                .select('phone')
                .eq('id', inspection.requester_id)
                .single();
            phone = profile?.phone;
        }

        if (phone) {
            const message = newStatus === 'Confirmed' 
                ? `✅ Good news! Your inspection request for "${prop.title || 'a property'}" has been CONFIRMED by the landlord. Please login to your HOSTELPULSE dashboard to pay the ₦2,000 Escrow fee to secure your slot.`
                : `❌ Your inspection request for "${prop.title || 'a property'}" was CANCELLED by the landlord. Log in to HOSTELPULSE to find other available properties.`;
                
            await db.from('messages_queue').insert({
                user_id: inspection.requester_id,
                phone_number: phone.replace(/\D/g, ''),
                message_body: message,
                status: 'pending'
            });
        }
        
        // Trigger In-App UI Notification
        await db.from('notifications').insert({
            user_id: inspection.requester_id,
            title: newStatus === 'Confirmed' ? 'Inspection Confirmed' : 'Inspection Cancelled',
            message: newStatus === 'Confirmed' 
                ? `Your inspection request for "${prop.title || 'a property'}" has been CONFIRMED. Please pay the Escrow fee.`
                : `Your inspection request for "${prop.title || 'a property'}" was CANCELLED.`,
            type: newStatus === 'Confirmed' ? 'success' : 'error',
            is_read: false
        });
    }

    return { success: true };
}
