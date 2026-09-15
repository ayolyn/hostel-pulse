"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotificationEmail } from '@/lib/email/resend';

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
            // Fallback check for campus market / custom orders
            const { data: escrowData } = await supabase
                .from("escrow_transactions")
                .select("id")
                .eq("payer_id", user.id)
                .eq("payee_id", payload.providerId)
                .in("status", ["completed", "Released"])
                .limit(1);
            
            if (!escrowData || escrowData.length === 0) {
                return { error: "You can only review providers you have completed a booking or transaction with." };
            }
        }

        const isVerifiedInteraction = true; // Guaranteed true since we require a booking/transaction

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
            if (insertError.code === '23505') {
                return { error: "You have already reviewed this booking!" };
            }
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
            const htmlBody = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #111111;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="font-size: 28px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.5px;">Thanks for your review! 🎉</h1>
                    </div>
                    
                    <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 24px; padding: 32px; margin-bottom: 32px;">
                        <p style="font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 24px; font-weight: 500;">
                            Your feedback helps build trust in our community. We really appreciate you taking the time to share your experience!
                        </p>
                        
                        <div style="background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 16px; padding: 20px;">
                            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                <div style="color: #fbbf24; font-size: 20px; letter-spacing: 2px;">
                                    ${'★'.repeat(payload.rating)}${'☆'.repeat(5 - payload.rating)}
                                </div>
                            </div>
                            <p style="font-size: 15px; color: #4b5563; margin: 0; font-weight: 500; font-style: italic;">
                                "${payload.comment || 'No written comment'}"
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding-top: 20px; border-top: 2px dashed #f3f4f6;">
                        <p style="font-size: 12px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
                            Hostel Pulse &copy; ${new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            `;
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
