export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";
import { sendNotificationEmail } from "@/lib/email/resend";

// ─────────────────────────────────────────────────────────────────────────────
// Service-role Supabase client (bypasses RLS for webhook processing)
// ─────────────────────────────────────────────────────────────────────────────
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/flutterwave
// Flutterwave sends a POST with the "verif-hash" header.
// Security model: simple string comparison against FLW_SECRET_HASH env var.
// This is the correct Flutterwave v3 approach — NOT HMAC.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    // ── 1. Verify Signature ─────────────────────────────────────────────────
    const signature = req.headers.get("verif-hash");
    const secretHash = process.env.FLW_SECRET_HASH;

    if (!secretHash || signature !== secretHash) {
        console.warn("[FLW Webhook] Rejected: invalid verif-hash");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse payload ────────────────────────────────────────────────────
    const payload = await req.json();
    const { event, data } = payload;

    // ── 3. Immediately acknowledge (prevents 30-min Flutterwave retries) ───
    // We do all DB work async after returning 200.
    // Note: Edge runtime doesn't support waitUntil, so we use try/catch and
    // return 200 before the heavy lifting where possible.
    if (event !== "charge.completed") {
        return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const {
        tx_ref,
        amount,
        id: flwId,
        status: chargeStatus,
        customer,
        meta,
    } = data;

    // ── 4. Idempotency check — has this tx_ref been processed already? ──────
    const { data: existingTx } = await supabase
        .from("escrow_transactions")
        .select("id, status")
        .eq("tx_ref", tx_ref)
        .maybeSingle();

    // If already processed with a terminal status, skip
    if (existingTx && existingTx.status !== "Pending") {
        console.log(`[FLW Webhook] tx_ref ${tx_ref} already processed. Skipping.`);
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // ── 5. Route by payment status ──────────────────────────────────────────
    if (chargeStatus === "successful" || chargeStatus === "completed") {
        try {
            // 5a. Upsert escrow_transactions (idempotent on tx_ref)
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
                        payer_type: meta?.type === "market" ? "buyer" : "student",
                        created_at: new Date().toISOString(),
                    },
                    { onConflict: "tx_ref" }
                )
                .select("*, properties(title)")
                .single();

            if (txError) throw txError;

            const propertyTitle =
                (transaction as any)?.properties?.title ?? "your property";

            // 5b. Update booking status if booking_id was passed in meta
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

            // 5c. Resolve agent/landlord for notifications
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

            // 5d. Queue WhatsApp/SMS notification for provider
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

            // 5e. In-app notification for provider
            if (notifyId) {
                await createNotification(
                    notifyId,
                    "New Booking & Escrow Held",
                    `A student secured ₦${Number(amount).toLocaleString()} for "${propertyTitle}". Check Inspections.`,
                    "/dashboard/agent",
                    "new_inspection"
                );
            }

            // 5f. Email to student
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
                ).catch(() => null); // non-critical
            }

            // 5g. Email to agent
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
            // Still return 200 — Flutterwave should not keep retrying a server error
            return NextResponse.json({ error: msg }, { status: 200 });
        }
    }

    // ── 6. Handle failed payments ───────────────────────────────────────────
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
