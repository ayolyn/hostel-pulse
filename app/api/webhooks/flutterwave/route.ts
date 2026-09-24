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
    const isDeposit = meta?.type === "deposit";

    if (isDeposit) {
        // --- DEPOSIT FLOW ---
        if (chargeStatus === "successful" || chargeStatus === "completed") {
            // Calculate settled amount (what the merchant actually receives)
            const settledAmount = data.settlement_amount ? Number(data.settlement_amount) : (Number(amount) - Number(data.app_fee || 0));

            // Check if already processed
            const { data: existingDeposit } = await supabase
                .from("deposits")
                .select("id")
                .eq("reference", tx_ref)
                .maybeSingle();

            if (existingDeposit) {
                return NextResponse.json({ message: "Already processed deposit" }, { status: 200 });
            }

            // Insert deposit record
            const { error: depositError } = await supabase
                .from("deposits")
                .insert({
                    user_id: meta.payer_id,
                    amount: settledAmount,
                    status: "Completed",
                    reference: tx_ref
                });

            if (depositError) throw depositError;

            // Increment wallet balance
            const { data: profile } = await supabase
                .from("profiles")
                .select("wallet_balance")
                .eq("id", meta.payer_id)
                .single();

            if (profile) {
                const newBalance = Number(profile.wallet_balance || 0) + settledAmount;
                await supabase
                    .from("profiles")
                    .update({ wallet_balance: newBalance })
                    .eq("id", meta.payer_id);
            }

            // Notify
            await createNotification(
                meta.payer_id,
                'Wallet Funded',
                `Successfully deposited ₦${settledAmount.toLocaleString()} into your wallet.`,
                '/dashboard/student?tab=wallet',
                'deposit'
            );

            return NextResponse.json({ message: "Deposit processed" }, { status: 200 });
        }
        return NextResponse.json({ message: "Deposit not successful" }, { status: 200 });
    }

    // --- ESCROW FLOW (Rent, Buy, Market, etc.) ---
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
                const { data: newQuantity } = await supabase
                    .rpc('decrement_market_quantity', { listing_id_param: meta.listing_id });

                if (newQuantity !== null && newQuantity <= 0) {
                    await supabase
                        .from('market_listings')
                        .update({ status: 'sold' })
                        .eq('id', meta.listing_id);
                }

                if (meta.seller_id) {
                    await createNotification(
                        meta.seller_id,
                        'New Sale!',
                        'Your item was purchased via Card and funds are locked in Escrow.',
                        '/dashboard/student?tab=wallet',
                        'new_sale'
                    );
                }
                
                if (meta.payer_id) {
                    await createNotification(
                        meta.payer_id,
                        'Checkout Successful',
                        'Funds securely locked in Escrow.',
                        '/dashboard/student?tab=wallet',
                        'new_purchase'
                    );
                }
                return NextResponse.json({ message: "Market payment handled" }, { status: 200 });
            }

            // --- PROPERTY RENT/BUY FLOW ---
            if (meta?.booking_id) {
                const { error: bookingErr } = await supabase
                    .from("bookings")
                    .update({ status: "Paid", escrow_id: transaction.id })
                    .eq("id", meta.booking_id);

                if (bookingErr) throw bookingErr;
                
                // Notify user
                await createNotification(
                    meta.payer_id,
                    'Payment Successful',
                    `Your payment of ₦${Number(amount).toLocaleString()} is securely held in escrow.`,
                    '/dashboard/student?tab=wallet',
                    'payment_success'
                );

                // Notify provider
                const providerId = meta.agent_id || meta.landlord_id;
                if (providerId) {
                    await createNotification(
                        providerId,
                        'New Payment Received',
                        `A payment of ₦${Number(amount).toLocaleString()} is locked in escrow for your property.`,
                        '/dashboard/agent?tab=wallet',
                        'new_escrow'
                    );

                    // Send email to provider
                    const { data: { user: providerUser }, error: userError } = await supabase.auth.admin.getUserById(providerId);
                    if (providerUser?.email) {
                        const htmlBody = `
                            <div style="background-color: #f6f9fc; font-family: sans-serif; padding: 40px 0;">
                                <div style="background-color: #ffffff; padding: 40px; border-radius: 4px; margin: 0 auto; max-width: 600px;">
                                    <h2 style="font-size: 24px; font-weight: bold; color: #16a34a; margin-top: 0;">New Escrow Payment 🔒</h2>
                                    <p style="font-size: 16px; color: #555;">
                                        Great news! A payment of <strong>₦${Number(amount).toLocaleString()}</strong> has been securely held in escrow for your property: <strong>${transaction.properties?.title || 'Property'}</strong>.
                                    </p>
                                    <p style="font-size: 16px; color: #555;">
                                        Please reach out to the student to schedule an inspection or finalize the handover.
                                    </p>
                                </div>
                            </div>
                        `;
                        await sendNotificationEmail(
                            providerUser.email,
                            'New Escrow Payment Received 🔒',
                            htmlBody
                        ).catch(err => console.error("Email failed:", err));
                    }
                }
            }

            return NextResponse.json({ message: "Processed successfully" }, { status: 200 });

        } catch (error: any) {
            console.error("Webhook Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Unhandled status" }, { status: 200 });
}
