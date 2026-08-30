export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { releaseEscrowFunds } from '@/app/actions/escrow';
import { createNotification } from '@/lib/notifications';

export async function GET(req: Request) {
    try {
        // Verify authorization if you are calling this via a cron service like Vercel Cron.
        // For security, you can check an authorization header matching a cron secret.
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Calculate the timestamp for 24 hours ago
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // 1. Find all Confirmed inspections that were scheduled more than 24 hours ago
        const { data: expiredInspections, error: fetchError } = await supabaseAdmin
            .from('inspections')
            .select('id, requester_id, property_id, properties(owner_id, landlord_id)')
            .eq('status', 'Confirmed')
            .lt('scheduled_at', twentyFourHoursAgo);

        if (fetchError) throw fetchError;
        if (!expiredInspections || expiredInspections.length === 0) {
            return NextResponse.json({ success: true, message: 'No expired inspections found.', processed: 0 });
        }

        let processedCount = 0;

        for (const inspection of expiredInspections) {
            // Update inspection status to Completed
            const { error: updateError } = await supabaseAdmin
                .from('inspections')
                .update({ status: 'Completed' })
                .eq('id', inspection.id);

            if (updateError) {
                console.error(`Failed to update inspection ${inspection.id}:`, updateError);
                continue;
            }

            // Auto-release the associated Escrow funds
            const { data: escrowTx } = await supabaseAdmin
                .from('escrow_transactions')
                .select('id')
                .eq('reference_id', inspection.id)
                .eq('type', 'INSPECTION_FEE')
                .eq('status', 'Held')
                .maybeSingle();
                
            if (escrowTx) {
                await releaseEscrowFunds(escrowTx.id);
            }

            // Send notification to the student
            await createNotification(
                inspection.requester_id,
                'Inspection Auto-Completed',
                'Your inspection has been automatically marked as completed after 24 hours, and the escrow funds have been released to the landlord.',
                '/dashboard/student?tab=inspections',
                'inspection_completed'
            );

            // Send notification to the landlord
            const landlordId = (inspection.properties as any)?.owner_id || (inspection.properties as any)?.landlord_id;
            if (landlordId) {
                await createNotification(
                    landlordId,
                    'Escrow Auto-Released',
                    'An inspection passed the 24-hour mark and was auto-completed. The funds have been released to your Available Payout.',
                    '/dashboard/landlord?tab=wallet',
                    'wallet'
                );
            }

            processedCount++;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully auto-released ${processedCount} inspections.`,
            processed: processedCount
        });

    } catch (error: any) {
        console.error('Auto-release cron error:', error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
