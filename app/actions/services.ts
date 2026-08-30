"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

export async function bookStudentService(payload: {
    serviceType: string;
    details: any;
    totalCost: number;
    serviceFee: number;
}) {
    try {
        const supabase = await createClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Not authenticated" };
        }

        // 2. Fetch current wallet balance
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("wallet_balance, full_name")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            return { error: "Failed to fetch wallet balance" };
        }

        const currentBalance = Number(profile.wallet_balance || 0);

        // 3. Verify funds
        if (currentBalance < payload.totalCost) {
            return { error: "Insufficient funds for this service." };
        }
        if (payload.totalCost <= 0) {
            return { error: "Invalid service cost." };
        }

        // 4. Create Service Request
        const { error: serviceError } = await supabase
            .from("student_services")
            .insert({
                student_id: user.id,
                service_type: payload.serviceType,
                details: payload.details,
                total_cost: payload.totalCost,
                service_fee: payload.serviceFee,
                status: "PENDING"
            });

        if (serviceError) {
            console.error("Service insert error:", serviceError);
            return { error: "Failed to process service request." };
        }

        // 5. Deduct from wallet balance (Escrowed)
        const newBalance = currentBalance - payload.totalCost;
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ wallet_balance: newBalance })
            .eq("id", user.id);

        if (updateError) {
            console.error("Wallet update error after booking service:", updateError);
            return { error: "Failed to update wallet balance." };
        }

        // 6. Send Notification to Admin
        // We assume admin checks their dashboard, but we can send a system notification if we have an admin role
        
        // 7. Send Notification to User
        await supabase.from("notifications").insert({
            user_id: user.id,
            title: "Service Booked",
            body: `Your request for ${payload.serviceType} has been received. ₦${payload.totalCost.toLocaleString()} has been escrowed.`,
            type: "alert",
            is_read: false
        });

        // 8. Revalidate dashboard
        revalidatePath("/services");
        revalidatePath("/dashboard/student");

        return { success: true, newBalance };

    } catch (err: any) {
        console.error("bookStudentService Exception:", err);
        return { error: "An unexpected error occurred." };
    }
}

export async function updateServiceStatus(serviceId: string, newStatus: string, studentId: string, totalCost: number) {
    try {
        const supabase = await createClient();

        // Verify admin (basic check, could be expanded to verify role)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Not authenticated" };
        }

        // 1. Update status
        const { error: updateError } = await supabase
            .from("student_services")
            .update({ status: newStatus })
            .eq("id", serviceId);

        if (updateError) {
            return { error: "Failed to update status." };
        }

        // 2. Handle specific status actions
        if (newStatus === "CANCELLED") {
            // Refund the user's wallet
            const { data: profile } = await supabase
                .from("profiles")
                .select("wallet_balance")
                .eq("id", studentId)
                .single();
                
            if (profile) {
                await supabase
                    .from("profiles")
                    .update({ wallet_balance: Number(profile.wallet_balance || 0) + totalCost })
                    .eq("id", studentId);
            }
            
            // Notify user of cancellation & refund
            await supabase.from("notifications").insert({
                user_id: studentId,
                title: "Service Cancelled",
                body: `Your service request was cancelled. ₦${totalCost.toLocaleString()} has been refunded to your wallet.`,
                type: "alert",
                is_read: false
            });
        } else if (newStatus === "ACCEPTED") {
            await supabase.from("notifications").insert({
                user_id: studentId,
                title: "Service Accepted",
                body: `Your service request is now being processed by a provider.`,
                type: "alert",
                is_read: false
            });
        } else if (newStatus === "COMPLETED") {
            await supabase.from("notifications").insert({
                user_id: studentId,
                title: "Service Completed",
                body: `Your service request has been completed successfully!`,
                type: "alert",
                is_read: false
            });
        }

        revalidatePath("/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c");
        return { success: true };

    } catch (err: any) {
        console.error("updateServiceStatus Exception:", err);
        return { error: "An unexpected error occurred." };
    }
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Create an admin client to bypass RLS on student_services
const getAdminClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

export async function getAdminServices() {
    try {
        const adminClient = getAdminClient();
        
        const { data: services, error } = await adminClient
            .from("student_services")
            .select("*")
            .order("created_at", { ascending: false });
            
        if (error || !services) {
            console.error("getAdminServices error:", error);
            return [];
        }
        
        // Fetch profiles for all unique student ids
        const userIds = new Set<string>();
        services.forEach(g => {
            if (g.student_id) userIds.add(g.student_id);
            if (g.details?.fulfiller_id) userIds.add(g.details.fulfiller_id);
        });

        const { data: profiles } = await adminClient
            .from("profiles")
            .select("id, full_name, contact_email")
            .in("id", Array.from(userIds));

        const profileMap = (profiles || []).reduce((acc: any, profile: any) => {
            acc[profile.id] = profile;
            return acc;
        }, {});

        // Attach profiles to services
        return services.map(service => ({
            ...service,
            profiles: profileMap[service.student_id] || null
        }));
    } catch (err: any) {
        console.error("getAdminServices Exception:", err);
        return [];
    }
}
