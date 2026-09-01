'use client';
export const runtime = 'edge';

import { MessageList } from '@/components/messages/MessageList';
import { MessagingLayout } from '@/components/messages/MessagingLayout';

export default function MessageCenter() {
    return (
        <MessagingLayout>
            <div className="mb-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-1">Secure Chat</p>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Messages
                </h1>
                <p className="text-gray-500 font-medium">Chat securely across the HOSTELPULSE network.</p>
            </div>

            <div className="max-w-4xl">
                <MessageList />
            </div>
        </MessagingLayout>
    );
}
