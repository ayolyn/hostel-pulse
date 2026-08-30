import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Extremely strict secure connection for webhooks
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    // Basic Security: Require an Authorization header matching an expected CRON_SECRET or ADMIN_TOKEN
    const authHeader = request.headers.get('Authorization');
    
    // Fallback secret for demo/development if environment var is not set
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET || 'HOSTELPULSE_secure_key_123';

    if (authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    try {
        // Fetch all pending messages
        const { data: messages, error } = await supabase
            .from('messages_queue')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(50); // Batch limit for stability

        if (error) throw error;

        if (!messages || messages.length === 0) {
            return NextResponse.json({ message: 'No pending messages', data: [] });
        }

        // Immediately lock these messages by setting their status to 'processing'
        // This prevents double-sending if n8n polls rapidly
        const messageIds = messages.map(m => m.id);
        await supabase
            .from('messages_queue')
            .update({ status: 'processing' })
            .in('id', messageIds);

        // Send payload to n8n consumer
        return NextResponse.json({
            message: `Retrieved ${messages.length} pending messages`,
            data: messages
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
