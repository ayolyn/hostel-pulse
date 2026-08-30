import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type PulseState = 'IDLE' | 'NEW_MESSAGE' | 'PAYMENT_HELD';

export function useSystemPulse(userId: string) {
    const [state, setState] = useState<PulseState>('IDLE');
    const supabase = createClient();

    const playPing = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play blocked by browser", e));
    };

    useEffect(() => {
        if (!userId) return;

        // Reset logic: Listen for tab changes or manual resets via custom events
        const handleReset = (e: any) => {
            if (e.detail?.type === 'MESSAGES' || e.detail?.type === 'WALLET') {
                setState('IDLE');
            }
        };
        window.addEventListener('reset-pulse', handleReset);

        // Initial check for unread messages
        async function checkUnread() {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', userId)
                .eq('is_read', false);
            
            if (count && count > 0) {
                setState('NEW_MESSAGE');
            }
        }
        checkUnread();

        // Subscribe to New Messages
        const msgChannel = supabase
            .channel(`pulse-msgs-${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${userId}`
            }, () => {
                setState('NEW_MESSAGE');
                playPing();
            })
            .subscribe();

        // Subscribe to Escrow Payments
        const escrowChannel = supabase
            .channel(`pulse-escrow-${userId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'escrow_transactions',
                filter: `seller_id=eq.${userId}`
            }, (payload: any) => {
                if (payload.new.status === 'Held') {
                    setState('PAYMENT_HELD');
                    playPing();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(msgChannel);
            supabase.removeChannel(escrowChannel);
            window.removeEventListener('reset-pulse', handleReset);
        };
    }, [userId, supabase]);

    const resetPulse = (type: 'MESSAGES' | 'WALLET') => {
        setState('IDLE');
        window.dispatchEvent(new CustomEvent('reset-pulse', { detail: { type } }));
    };

    return { state, resetPulse };
}
