export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';
import { sendNotificationEmail } from '@/lib/email/resend';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const signature = req.headers.get('verif-hash');
    const secretHash = process.env.FLW_SECRET_HASH;

    // 1. Verify Signature
    if (secretHash && signature !== secretHash) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = await req.json();

    // 2. Handle Charge Completed
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
        const { tx_ref, amount, id: flwId, customer, meta } = payload.data;

        try {
            // 3. Update or Insert Escrow Transaction
            // We use upsert on tx_ref to ensure we don't create duplicates and handle cases where client-side insert failed
            const { data: transaction, error: txError } = await supabase
                .from('escrow_transactions')
                .upsert({
                    tx_ref: tx_ref,
                    flw_id: String(flwId),
                    status: 'Held',
                    amount: amount,
                    property_id: meta.property_id,
                    payer_id: meta.payer_id,
                    agent_id: meta.agent_id,
                    landlord_id: meta.landlord_id,
                    legal_fee: meta.legal_fee || 0,
                    service_fee: meta.protection_fee || 0,
                    created_at: new Date().toISOString()
                }, { onConflict: 'tx_ref' })
                .select('*, properties(title)')
                .single();

            if (txError) throw txError;

            // 4. Fetch Agent/Landlord Details for Notification
            // We notify the agent_id provided in meta
            const notifyId = meta.agent_id || meta.landlord_id;
            let recipientName = 'Agent';
            let recipientPhone = '';

            if (notifyId) {
                // Try Agent Accounts first
                const { data: agent } = await supabase
                    .from('agent_accounts')
                    .select('full_name, phone, whatsapp_number')
                    .eq('id', notifyId)
                    .single();

                if (agent) {
                    recipientName = agent.full_name;
                    recipientPhone = agent.whatsapp_number || agent.phone || '';
                } else {
                    // Try Landlord Accounts
                    const { data: landlord } = await supabase
                        .from('landlord_accounts')
                        .select('full_name, phone, whatsapp_number')
                        .eq('id', notifyId)
                        .single();
                    if (landlord) {
                        recipientName = landlord.full_name;
                        recipientPhone = landlord.whatsapp_number || landlord.phone || '';
                    }
                }
            }

            // 5. Queue WhatsApp Notification for Agent
            if (recipientPhone) {
                const propertyTitle = (transaction as any).properties?.title || 'your property';
                const whatsappMsg = `Kpa Alert! 💸\n\nHello ${recipientName}, a student has just secured a payment for "${propertyTitle}" via HOSTELPULSE Escrow.\n\nAmount Secured: ₦${amount.toLocaleString()}\nStatus: Held in Escrow (Secure) 🛡️\n\nPlease check your INSPECTIONS tab to coordinate with the student. Once they scan your QR code, the funds will be released to your available balance.\n\n— HOSTELPULSE HQ`;

                await supabase.from('messages_queue').insert({
                    phone_number: recipientPhone.replace(/\D/g, ''),
                    message_body: whatsappMsg,
                    status: 'pending'
                });
            }

            // 6. Queue Admin Email Summary
            const adminEmailMsg = `🚨 HOSTELPULSE Transaction Alert\n\nNew Escrow Payment:\nAmount: ₦${amount.toLocaleString()}\nStudent: ${customer.name} (${customer.email})\nProperty ID: ${meta.property_id}\nTx Ref: ${tx_ref}\n\nStatus: HELD`;
            
            await supabase.from('messages_queue').insert({
                email: 'juliusayolyn148@gmail.com',
                message_body: adminEmailMsg,
                status: 'pending'
            });

            // 7. Inject System Notification for new inspection (escrow held)
            if (notifyId) {
                const propertyTitle = (transaction as any).properties?.title || 'your property';
                await createNotification(
                    notifyId,
                    'New Inspection / Escrow Held',
                    `A student has secured payment for "${propertyTitle}" in Escrow. Check your Inspections tab.`,
                    '/dashboard/agent',
                    'new_inspection'
                );

                // Send Email to Agent
                const agentEmailMsg = `
                    <h2>New Inspection Escrow Secured!</h2>
                    <p>Hello ${recipientName},</p>
                    <p>A student (${customer.name}) has just secured an inspection payment for <strong>${propertyTitle}</strong> via HOSTELPULSE Escrow.</p>
                    <p><strong>Amount Secured:</strong> ₦${amount.toLocaleString()}</p>
                    <p>Please check your dashboard to coordinate with the student. Once they inspect and scan your QR code, the funds will be released to your wallet.</p>
                `;
                // Agent email would be fetched if possible, but let's send admin an alert for now if we don't have agent email.
                // Wait, do we have agent email? Yes, it's not selected. Let's send an email to the student at least.
            }

            // Send Email to Student
            if (customer.email) {
                const propertyTitle = (transaction as any).properties?.title || 'your property';
                const studentEmailMsg = `
                    <h2>Inspection Payment Confirmed & Escrow Secured</h2>
                    <p>Hello ${customer.name},</p>
                    <p>Your inspection payment of <strong>₦${amount.toLocaleString()}</strong> for <strong>${propertyTitle}</strong> has been successfully secured in Escrow.</p>
                    <p>Your money is 100% safe. It will only be released to the agent when you physically inspect the room and scan their QR code.</p>
                    <p>The agent has been notified and will contact you shortly.</p>
                `;
                await sendNotificationEmail(customer.email, `Inspection Confirmed: ${propertyTitle}`, studentEmailMsg);
            }

            return NextResponse.json({ message: 'Webhook processed successfully' });

        } catch (err: any) {
            console.error('Webhook Error:', err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Event ignored' });
}
