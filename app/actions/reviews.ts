"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotificationEmail } from '@/lib/email/resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { render } from '@react-email/render';

export async function submitProviderReview(payload: {
    providerId: string;
    rating: number;
    comment?: string;
    propertyId?: string;
}) {
    try {
        const supabase = await createClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: "You must be logged in to leave a review." };
        }

        // 2. Prevent self-review
        if (user.id === payload.providerId) {
            return { error: "You cannot review yourself." };
        }

        // 3. Role check - Only student or non_student can leave a review
        const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();

        if (roleData?.role !== "student" && roleData?.role !== "non_student") {
            return { error: "Only students and community members can leave reviews." };
        }

        // 4. Verify Booking Check (Permanent Fix)
        // Check if there's a COMPLETED booking between reviewer and provider
        const { data: bookingData } = await supabase
            .from("bookings")
            .select("id")
            .eq("student_id", user.id)
            .eq("provider_id", payload.providerId)
            .eq("status", "Completed")
            .limit(1);

        if (!bookingData || bookingData.length === 0) {
            return { error: "You can only review providers you have completed a booking with." };
        }

        const isVerifiedInteraction = true; // Guaranteed true since we require a booking

        // 5. Insert Review
        const { error: insertError } = await supabase
            .from("provider_reviews")
            .insert({
                provider_id: payload.providerId,
                reviewer_id: user.id,
                rating: payload.rating,
                comment: payload.comment || null,
                property_id: payload.propertyId || null,
                is_verified_interaction: isVerifiedInteraction
            });

        if (insertError) {
            console.error("Review Insert Error:", insertError);
            return { error: "Failed to submit review. Please try again." };
        }

        // 5.5 Insert Notification to Provider
        await supabase.from("notifications").insert({
            user_id: payload.providerId,
            title: `New ${payload.rating}-Star Review!`,
            body: `You received a ${payload.rating}-star review from a student!`,
            type: "alert",
            is_read: false
        });

        // 6. Revalidate cache
        revalidatePath("/providers");
        revalidatePath(`/providers/${payload.providerId}`);

        // 7. Send Welcome/Thank You Email
        if (user.email) {
            const htmlBody = await render(WelcomeEmail({ userName: user.email.split('@')[0] }));
            await sendNotificationEmail(
                user.email,
                'Thanks for your review! 🎉',
                htmlBody
            );
        }

        return { success: true };

    } catch (err: any) {
        console.error("Submit Review Exception:", err);
        return { error: "An unexpected error occurred." };
    }
}
