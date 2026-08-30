'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function initiateDirectConversation(targetUserId: string) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in to send a message.' };
        }

        if (user.id === targetUserId) {
            return { success: false, error: 'You cannot message yourself.' };
        }

        // 1. Check if conversation already exists in `conversations` table
        const { data: existingConv, error: existingConvError } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant_a.eq.${user.id},participant_b.eq.${targetUserId}),and(participant_a.eq.${targetUserId},participant_b.eq.${user.id})`)
            .limit(1)
            .single();

        if (existingConv) {
            return { success: true, roomId: existingConv.id };
        }

        // 2. Check if conversation exists in `chat_rooms` table (fallback)
        const { data: existingRoom, error: existingRoomError } = await supabase
            .from('chat_rooms')
            .select('id')
            .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${targetUserId}),and(participant_one_id.eq.${targetUserId},participant_two_id.eq.${user.id})`)
            .limit(1)
            .single();

        if (existingRoom) {
            return { success: true, roomId: existingRoom.id };
        }

        // 3. Insert new conversation in `conversations` table
        const { data: newConv, error: insertError } = await supabase
            .from('conversations')
            .insert({
                participant_a: user.id,
                participant_b: targetUserId
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return { success: false, error: 'Failed to initialize chat.' };
        }

        return { success: true, roomId: newConv.id };
    } catch (error) {
        console.error('initiateDirectConversation error:', error);
        return { success: false, error: 'An unexpected error occurred while initializing chat.' };
    }
}
