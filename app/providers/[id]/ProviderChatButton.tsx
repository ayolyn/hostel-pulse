'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';
import { initiateDirectConversation } from '@/app/actions/messages';

export function ProviderChatButton({ providerId }: { providerId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChat = async () => {
        setLoading(true);
        try {
            const res = await initiateDirectConversation(providerId);
            if (res.error) {
                alert(res.error);
                setLoading(false);
            } else {
                router.push(`/messages/${providerId}`);
            }
        } catch (error) {
            console.error('Chat initialization error:', error);
            alert('Failed to initialize chat');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleChat}
            disabled={loading}
            className="w-full bg-black text-[#BEF264] px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <MessageSquare className="w-4 h-4" />
            )}
            {loading ? 'Connecting...' : 'Message App'}
        </button>
    );
}
