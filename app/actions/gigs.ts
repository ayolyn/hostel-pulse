"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Create an admin client to bypass RLS on student_services
const getAdminClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

export async function postGig(payload: {
    title: string;
    description: string;
    bounty: number;
    category: string;
}) {
    try {
        const authClient = await createServerClient();
        const adminClient = getAdminClient();

        // 1. Get current user
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        // 2. Fetch current wallet balance
        const { data: profile, error: profileError } = await adminClient
            .from("profiles")
            .select("wallet_balance, contact_email")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) return { error: "Failed to fetch wallet balance" };

        const currentBalance = Number(profile.wallet_balance || 0);

        if (currentBalance < payload.bounty) return { error: "Insufficient funds for this bounty." };
        if (payload.bounty < 500) return { error: "Minimum bounty is ₦500." };

        const serviceFee = payload.bounty * 0.05;

        // 5. Create Gig Request (Admin client bypasses RLS)
        const { error: serviceError } = await adminClient
            .from("student_services")
            .insert({
                student_id: user.id,
                service_type: payload.title,
                details: { 
                    description: payload.description,
                    category: payload.category,
                    fulfiller_id: null
                },
                total_cost: payload.bounty,
                service_fee: serviceFee,
                status: "OPEN"
            });

        if (serviceError) return { error: "Failed to post gig." };

        // 6. Deduct from wallet
        const newBalance = currentBalance - payload.bounty;
        await adminClient
            .from("profiles")
            .update({ wallet_balance: newBalance })
            .eq("id", user.id);

        // Send email to poster
        if (profile.contact_email) {
            await sendNotificationEmail(
                profile.contact_email,
                "Your Gig is Live! 🚀",
                `<div style="font-family: sans-serif; padding: 20px;">
                    <h2>Awesome! Your gig is now live on the board.</h2>
                    <p>You posted: <strong>${payload.title}</strong> for ₦${payload.bounty}</p>
                    <p>We'll notify you as soon as someone claims it.</p>
                </div>`
            );
        }

        revalidatePath("/dashboard/student");
        revalidatePath("/services");
        return { success: true, newBalance };
    } catch (err: any) {
        return { error: "An unexpected error occurred." };
    }
}

import { sendNotificationEmail } from "@/lib/email/resend";

export async function claimGig(gigId: string) {
    try {
        const authClient = await createServerClient();
        const adminClient = getAdminClient();

        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { data: gig } = await adminClient
            .from("student_services")
            .select("*")
            .eq("id", gigId)
            .single();

        if (!gig) return { error: "Gig not found" };
        if (gig.status !== "OPEN") return { error: "Gig is no longer available" };
        if (gig.student_id === user.id) return { error: "You cannot claim your own gig" };

        const newDetails = { ...gig.details, fulfiller_id: user.id };
        const { error: updateError } = await adminClient
            .from("student_services")
            .update({ status: "CLAIMED", details: newDetails })
            .eq("id", gigId);

        if (updateError) return { error: "Failed to claim gig" };

        await adminClient.from("notifications").insert({
            user_id: gig.student_id,
            title: "Gig Claimed!",
            body: `Someone has claimed your gig: ${gig.service_type}. Check your gigs tab.`,
            type: "alert",
            is_read: false
        });

        // Send email to poster
        const { data: posterProfile } = await adminClient
            .from("profiles")
            .select("contact_email, full_name")
            .eq("id", gig.student_id)
            .single();

        if (posterProfile?.contact_email) {
            await sendNotificationEmail(
                posterProfile.contact_email,
                "Your Gig was Claimed! 🎉",
                `<div style="font-family: sans-serif; padding: 20px;">
                    <h2>Good news, ${posterProfile.full_name?.split(' ')[0] || 'Student'}!</h2>
                    <p>Someone has claimed your gig: <strong>${gig.service_type}</strong></p>
                    <p>Please log in to Hostel Pulse to view their contact info and coordinate with them.</p>
                    <a href="https://hostelpulse.app/dashboard/student?tab=services" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #BEF264; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">View Gig</a>
                </div>`
            );
        }

        revalidatePath("/dashboard/student");
        revalidatePath("/services");
        return { success: true };
    } catch (err: any) {
        return { error: "An unexpected error occurred." };
    }
}

export async function completeGig(gigId: string) {
    try {
        const authClient = await createServerClient();
        const adminClient = getAdminClient();

        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { data: gig } = await adminClient
            .from("student_services")
            .select("*")
            .eq("id", gigId)
            .single();

        if (!gig) return { error: "Gig not found" };
        if (gig.status !== "CLAIMED") return { error: "Gig is not in a claimable state" };
        if (gig.student_id !== user.id) return { error: "Only the gig poster can mark it as complete" };

        const fulfillerId = gig.details?.fulfiller_id;
        if (!fulfillerId) return { error: "No fulfiller assigned" };

        const { error: updateError } = await adminClient
            .from("student_services")
            .update({ status: "COMPLETED" })
            .eq("id", gigId);

        if (updateError) return { error: "Failed to update gig" };

        const payout = Number(gig.total_cost) - Number(gig.service_fee);
        
        const { data: fulfillerProfile } = await adminClient
            .from("profiles")
            .select("wallet_balance, contact_email")
            .eq("id", fulfillerId)
            .single();

        if (fulfillerProfile) {
            await adminClient
                .from("profiles")
                .update({ wallet_balance: Number(fulfillerProfile.wallet_balance || 0) + payout })
                .eq("id", fulfillerId);
                
            if (fulfillerProfile.contact_email) {
                await sendNotificationEmail(
                    fulfillerProfile.contact_email,
                    "Gig Completed & Paid! 💰",
                    `<div style="font-family: sans-serif; padding: 20px;">
                        <h2>Great job!</h2>
                        <p>The gig <strong>${gig.service_type}</strong> has been marked as complete.</p>
                        <p>We've added <strong>₦${payout.toLocaleString()}</strong> to your wallet.</p>
                    </div>`
                );
            }
        }

        await adminClient.from("notifications").insert({
            user_id: fulfillerId,
            title: "Gig Completed & Paid!",
            body: `You earned ₦${payout.toLocaleString()} for completing: ${gig.service_type}`,
            type: "alert",
            is_read: false
        });

        revalidatePath("/dashboard/student");
        revalidatePath("/services");
        return { success: true };
    } catch (err: any) {
        return { error: "An unexpected error occurred." };
    }
}

export async function cancelGig(gigId: string) {
    try {
        const authClient = await createServerClient();
        const adminClient = getAdminClient();

        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { data: gig } = await adminClient
            .from("student_services")
            .select("*")
            .eq("id", gigId)
            .single();

        if (!gig) return { error: "Gig not found" };
        if (gig.student_id !== user.id) return { error: "Not authorized" };
        if (gig.status === "COMPLETED" || gig.status === "CANCELLED") return { error: "Cannot cancel this gig now" };

        const { error: updateError } = await adminClient
            .from("student_services")
            .update({ status: "CANCELLED" })
            .eq("id", gigId);

        if (updateError) return { error: "Failed to cancel gig" };

        const { data: profile } = await adminClient
            .from("profiles")
            .select("wallet_balance")
            .eq("id", user.id)
            .single();

        if (profile) {
            await adminClient
                .from("profiles")
                .update({ wallet_balance: Number(profile.wallet_balance || 0) + Number(gig.total_cost) })
                .eq("id", user.id);
        }

        if (gig.details?.fulfiller_id) {
            await adminClient.from("notifications").insert({
                user_id: gig.details.fulfiller_id,
                title: "Gig Cancelled",
                body: `The gig you claimed (${gig.service_type}) was cancelled by the poster.`,
                type: "alert",
                is_read: false
            });
        }

        revalidatePath("/dashboard/student");
        revalidatePath("/services");
        return { success: true };
    } catch (err: any) {
        return { error: "An unexpected error occurred." };
    }
}

export async function disputeGig(gigId: string) {
    try {
        const authClient = await createServerClient();
        const adminClient = getAdminClient();

        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { error: updateError } = await adminClient
            .from("student_services")
            .update({ status: "DISPUTED" })
            .eq("id", gigId);

        if (updateError) return { error: "Failed to dispute gig" };

        revalidatePath("/dashboard/student");
        revalidatePath("/services");
        return { success: true };
    } catch (err: any) {
        return { error: "An unexpected error occurred." };
    }
}

export async function getCampusGigs() {
    try {
        const adminClient = getAdminClient();
        
        const { data: gigs, error } = await adminClient
            .from("student_services")
            .select("*")
            .order("created_at", { ascending: false });
            
        if (error || !gigs) return [];

        // Fetch profiles for all unique poster and fulfiller ids
        const userIds = new Set<string>();
        gigs.forEach(g => {
            if (g.student_id) userIds.add(g.student_id);
            if (g.details?.fulfiller_id) userIds.add(g.details.fulfiller_id);
        });

        const { data: profiles } = await adminClient
            .from("profiles")
            .select("id, full_name, avatar_url, contact_email")
            .in("id", Array.from(userIds));

        const profileMap = (profiles || []).reduce((acc: any, profile: any) => {
            acc[profile.id] = profile;
            return acc;
        }, {});

        // Attach profiles to gigs
        return gigs.map(gig => ({
            ...gig,
            profiles: profileMap[gig.student_id] || null, // Keeping for backward compat in open board
            poster_profile: profileMap[gig.student_id] || null,
            fulfiller_profile: gig.details?.fulfiller_id ? profileMap[gig.details.fulfiller_id] : null
        }));
    } catch (err: any) {
        return [];
    }
}
