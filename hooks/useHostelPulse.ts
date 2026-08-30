'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type PulseState = 'DEFAULT' | 'MESSAGES' | 'ESCROW';

/**
 * useHostelPulse — Real-time pulse indicator for the HostelPulse brand.
 * 
 * - Neon Green (#BEF264): Unread message exists
 * - Gold (#FFD700): Payment status changed to 'HELD' in escrow
 * - Default Blue (#3B82F6): No active notifications
 * 
 * Listens to both messages and escrow_transactions tables in real-time.
 */
export function useHostelPulse(userId: string | null) {
    const [pulseState, setPulseState] = useState<PulseState>('DEFAULT');
    const supabase = createClient();

    useEffect(() => {
        if (!userId) return;

        // Initial check for unread messages
        async function checkInitialState() {
            const { count: msgCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', userId!)
                .eq('is_read', false);
            
            if (msgCount && msgCount > 0) {
                setPulseState('MESSAGES');
                return;
            }

            // Check for recent HELD escrow transactions (last 24h)
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count: escrowCount } = await supabase
                .from('escrow_transactions')
                .select('*', { count: 'exact', head: true })
                .or(`payer_id.eq.${userId},landlord_id.eq.${userId},agent_id.eq.${userId}`)
                .eq('status', 'Held')
                .gte('created_at', twentyFourHoursAgo);
            
            if (escrowCount && escrowCount > 0) {
                setPulseState('ESCROW');
                return;
            }

            setPulseState('DEFAULT');
        }

        checkInitialState();

        // Real-time: New messages
        const msgChannel = supabase
            .channel('pulse-messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${userId}`
            }, () => {
                setPulseState('MESSAGES');
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${userId}`
            }, async () => {
                // Re-check unread count
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('receiver_id', userId!)
                    .eq('is_read', false);
                
                if (!count || count === 0) {
                    // Check escrow next
                    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                    const { count: escrowCount } = await supabase
                        .from('escrow_transactions')
                        .select('*', { count: 'exact', head: true })
                        .or(`payer_id.eq.${userId},landlord_id.eq.${userId},agent_id.eq.${userId}`)
                        .eq('status', 'Held')
                        .gte('created_at', twentyFourHoursAgo);
                    
                    setPulseState(escrowCount && escrowCount > 0 ? 'ESCROW' : 'DEFAULT');
                }
            })
            .subscribe();

        // Real-time: Escrow status changes
        const escrowChannel = supabase
            .channel('pulse-escrow')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'escrow_transactions',
            }, (payload: any) => {
                if (payload.new?.status === 'Held') {
                    setPulseState('ESCROW');
                }
            })
            .subscribe();

        // Listen for manual reset events
        const handleReset = (e: CustomEvent) => {
            if (e.detail?.type === 'MESSAGES') {
                // Re-check
                checkInitialState();
            } else {
                setPulseState('DEFAULT');
            }
        };
        window.addEventListener('reset-pulse', handleReset as EventListener);

        return () => {
            supabase.removeChannel(msgChannel);
            supabase.removeChannel(escrowChannel);
            window.removeEventListener('reset-pulse', handleReset as EventListener);
        };
    }, [userId, supabase]);

    const pulseColor = pulseState === 'MESSAGES' 
        ? '#BEF264'      // Neon Green
        : pulseState === 'ESCROW' 
        ? '#FFD700'       // Gold
        : '#3B82F6';      // Default Blue

    const pulseLabel = pulseState === 'MESSAGES'
        ? 'New Message'
        : pulseState === 'ESCROW'
        ? 'Payment Held'
        : 'System Online';

    return { pulseState, pulseColor, pulseLabel };
}
