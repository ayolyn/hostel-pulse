'use client';

import { use } from 'react';
import { MessagingLayout } from '@/components/messages/MessagingLayout';
import { PrivateChat } from '@/components/messages/PrivateChat';

export default function DirectChatPage({ params }: { params: { id: string } }) {
    const { id } = params;

    return (
        <MessagingLayout>
            <div className="max-w-4xl mx-auto">
                <PrivateChat receiverId={id} />
            </div>
        </MessagingLayout>
    );
}
