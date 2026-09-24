export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";
import { sendNotificationEmail } from "@/lib/email/resend";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const signature = req.headers.get("verif-hash");
    const secretHash = process.env.FLW_SECRET_HASH;

    if (!secretHash || signature !== secretHash) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { event, data } = payload;

    if (event !== "charge.completed") {
        return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const { tx_ref, amount, id: flwId, status: chargeStatus, customer, meta } = data;

    const { data: existingTx } = await supabase
        .from("escrow_transactions")
        .select("id, status")
        .eq("tx_ref", tx_ref)
        .maybeSingle();

    if (existingTx && existingTx.status !== "Pending") {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    if (chargeStatus === "successful" || chargeStatus === "completed") {
        try {
            // Upsert escrow_transactions
            const isMarket = meta?.type === "market";
            
            const { data: transaction, error: txError } = await supabase
                .from("escrow_transactions")
                .upsert(
                    {
                        tx_ref,
                        flw_id: String(flwId),
                        status: "Held",
                        amount,
                        property_id: meta?.property_id ?? null,
                        payer_id: meta?.payer_id ?? null,
                        agent_id: meta?.agent_id ?? null,
                        landlord_id: meta?.landlord_id ?? null,
                        legal_fee: meta?.legal_fee ?? 0,
                        service_fee: meta?.protection_fee ?? 0,
                        payer_type: isMarket ? "buyer" : "student",
                        payee_id: meta?.seller_id ?? null,
                        payee_type: isMarket ? "student" : null,
                        listing_id: meta?.listing_id ?? null,
                        created_at: new Date().toISOString(),
                    },
                    { onConflict: "tx_ref" }
                )
                .select("*, properties(title)")
                .single();

            if (txError) throw txError;

            // --- MARKET FLOW ---
            if (isMarket && meta?.listing_id) {
                // Decrement quantity atomically
                const { data: newQuantity } = await supabase
                    .rpc('decrement_market_quantity', { listing_id_param: meta.listing_id });

                if (newQuantity !== null && newQuantity <= 0) {
                    await supabase
                        .from('market_listings')
                        .update({ status: 'sold' })
                        .eq('id', meta.listing_id);
                }

                // Notify Seller
                if (meta.seller_id) {
                    await createNotification(
                        meta.seller_id,
                        'New Sale!',
                        'Your item was purchased via Card and funds are locked in Escrow.',
                        '/dashboard/student?tab=wallet',
                        'new_sale'
                    );
                }
                
                // Notify Buyer
                if (meta.payer_id) {
                    await createNotification(
                        meta.payer_id,
                        'Checkout Successful',
                        'Funds securely locked in Escrow.',
                        '/dashboard/student?tab=wallet',
                        'new_sale'
                    );
                }
                return NextResponse.json({ message: "Market Webhook processed" }, { status: 200 });
            }

            // --- RENT FLOW ---
            const propertyTitle = (transaction as any)?.properties?.title ?? "your property";

            if (meta?.booking_id) {
                await supabase
                    .from("bookings")
                    .update({
                        status: "CONFIRMED",
                        payment_status: "PAID",
                        tx_ref,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", meta.booking_id);
            }

            const notifyId = meta?.agent_id ?? meta?.landlord_id ?? null;
            let recipientName = "Agent";
            let recipientEmail = "";
            let recipientPhone = "";

            if (notifyId) {
                const { data: agent } = await supabase
                    .from("agent_accounts")
                    .select("full_name, phone, whatsapp_number, email")
                    .eq("id", notifyId)
                    .maybeSingle();

                if (agent) {
                    recipientName = agent.full_name ?? "Agent";
                    recipientPhone = agent.whatsapp_number ?? agent.phone ?? "";
                    recipientEmail = agent.email ?? "";
                } else {
                    const { data: landlord } = await supabase
                        .from("landlord_accounts")
                        .select("full_name, phone, whatsapp_number, contact_email")
                        .eq("id", notifyId)
                        .maybeSingle();

                    if (landlord) {
                        recipientName = landlord.full_name ?? "Landlord";
                        recipientPhone = landlord.whatsapp_number ?? landlord.phone ?? "";
                        recipientEmail = landlord.contact_email ?? "";
                    }
                }
            }

            if (recipientPhone) {
                const msg =
                    `🔔 Kpa Alert!\n\nHello ${recipientName}, a student just secured payment for "${propertyTitle}" via HostelPulse Escrow.\n\n` +
                    `Amount Secured: ₦${Number(amount).toLocaleString()}\nStatus: Held in Escrow 🔒\n\n` +
                    `Check your INSPECTIONS tab to coordinate. Funds release when they scan your QR code.\n\n— HostelPulse HQ`;

                await supabase.from("messages_queue").insert({
                    phone_number: recipientPhone.replace(/\D/g, ""),
                    message_body: msg,
                    status: "pending",
                });
            }

            if (notifyId) {
                await createNotification(
                    notifyId,
                    "New Booking & Escrow Held",
                    `A student secured ₦${Number(amount).toLocaleString()} for "${propertyTitle}". Check Inspections.`,
                    "/dashboard/agent",
                    "new_inspection"
                );
            }

            if (customer?.email) {
                const studentHtml = `
                    <h2>Booking Confirmed — Escrow Secured ✅</h2>
                    <p>Hello ${customer.name ?? "there"},</p>
                    <p>Your payment of <strong>₦${Number(amount).toLocaleString()}</strong> for <strong>${propertyTitle}</strong> has been confirmed and is held securely in HostelPulse Escrow.</p>
                    <p><strong>Your money is 100% safe.</strong> It will only be released to the agent after you physically inspect the room and scan their QR code.</p>
                    <p>The agent has been notified and will reach out shortly.</p>
                    <p style="font-size:12px;color:#999;">Transaction Ref: ${tx_ref}</p>
                `;
                await sendNotificationEmail(
                    customer.email,
                    `Booking Confirmed: ${propertyTitle}`,
                    studentHtml
                ).catch(() => null);
            }

            if (recipientEmail) {
                const agentHtml = `
                    <h2>New Escrow Booking for "${propertyTitle}"</h2>
                    <p>Hello ${recipientName},</p>
                    <p>A student (${customer?.name ?? "unknown"}) has just secured an inspection payment of <strong>₦${Number(amount).toLocaleString()}</strong> for <strong>${propertyTitle}</strong> via HostelPulse Escrow.</p>
                    <p>Please log in to your dashboard and navigate to your Inspections tab to coordinate with the student.</p>
                `;
                await sendNotificationEmail(
                    recipientEmail,
                    `New Booking: ${propertyTitle}`,
                    agentHtml
                ).catch(() => null);
            }

            return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            console.error("[FLW Webhook] Error:", msg);
            return NextResponse.json({ error: msg }, { status: 200 });
        }
    }

    if (chargeStatus === "failed") {
        if (meta?.booking_id) {
            try {
                await supabase
                    .from("bookings")
                    .update({ status: "FAILED", payment_status: "FAILED" })
                    .eq("id", meta.booking_id);
            } catch { /* non-critical */ }
        }
        return NextResponse.json({ message: "Payment failure recorded" }, { status: 200 });
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
}
