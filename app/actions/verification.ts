"use server";

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';

export async function verifyStudentIdAuto(userId: string, imageUrl: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (!process.env.OPENAI_API_KEY) {
        console.log("No OPENAI_API_KEY found. Routing student ID directly to Admin HQ Account Queue.");
        // Ensure student profile has the uploaded ID and is queued for manual admin review
        await supabaseAdmin.from('profiles').update({
            student_id_url: imageUrl,
            is_verified: false,
            identity_verification_status: 'FLAGGED_FOR_MANUAL_REVIEW',
            internal_admin_notes: 'AI check skipped (OpenAI key not configured). Direct route to Admin HQ Account Queue for review.'
        }).eq('id', userId);

        await supabaseAdmin.from('student_accounts').update({
            student_id_url: imageUrl,
            is_approved: false
        }).eq('id', userId);

        await createNotification(
            userId,
            "ID Forwarded to Admin HQ 📋",
            "Your LAUTECH student ID has been received and forwarded to our Admin team for manual verification.",
            "/dashboard/student?tab=profile",
            "VERIFICATION_PENDING"
        );

        return { success: true, approved: false, forwardedToAdmin: true, reason: "Forwarded to Admin HQ for manual review" };
    }

    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `You are an intelligent KYC verification bot for Ladoke Akintola University of Technology (LAUTECH), Ogbomoso.
Inspect this uploaded student ID image carefully.
Respond strictly with a JSON object having the following fields:
- "approved" (boolean): true ONLY if this image is unambiguously an official, authentic LAUTECH student ID card, displaying "Ladoke Akintola University of Technology" or "LAUTECH", a visible student photo, and legible text.
- "confidence" (number): confidence score between 0.0 and 1.0.
- "reason" (string): concise explanation of your assessment (e.g. "Official LAUTECH Student ID confirmed", "Image blurry or low contrast", "Card partially obscured or angled", "Not a LAUTECH card", "Random image / not an ID").
- "needs_manual_review" (boolean): true if the card looks like a student ID but is unclear, blurry, dimly lit, angled, or requires human eyes at Admin HQ; false if clearly valid or blatant spam.`
                        },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 250,
        });

        const answerString = response.choices[0]?.message?.content || '{}';
        let answer: { approved?: boolean; confidence?: number; reason?: string; needs_manual_review?: boolean } = {};
        try {
            answer = JSON.parse(answerString);
        } catch {
            answer = { approved: false, reason: "Could not parse AI response", needs_manual_review: true };
        }

        const isFullyApproved = answer.approved === true && answer.needs_manual_review !== true && (answer.confidence === undefined || answer.confidence >= 0.75);

        if (isFullyApproved) {
            // Auto-Approve across profiles and role tables
            await supabaseAdmin.from('student_accounts').update({ is_approved: true, is_verified: true, student_id_url: imageUrl }).eq('id', userId);
            await supabaseAdmin.from('agent_accounts').update({ is_approved: true }).eq('id', userId);
            await supabaseAdmin.from('landlord_accounts').update({ is_approved: true }).eq('id', userId);
            await supabaseAdmin.from('profiles').update({
                is_verified: true,
                trust_level: 'Verified Member',
                student_id_url: imageUrl,
                identity_verification_status: 'AUTO_VERIFIED_AI',
                internal_admin_notes: `AI Verified: ${answer.reason || 'LAUTECH Student ID card confirmed'}`
            }).eq('id', userId);

            await createNotification(
                userId,
                "ID Verified Automatically 🎉",
                "Your LAUTECH student ID has been automatically verified by our AI system. You now have full access to Campus Market and all features!",
                "/dashboard/student?tab=profile",
                "VERIFICATION_SUCCESS"
            );

            return { success: true, approved: true, reason: answer.reason };
        } else {
            // If unclear, blurry, or unconfirmed, route to Admin HQ Account Queue for manual approval
            const reviewReason = answer.reason || "Image is unclear, blurry, or requires manual human review";

            await supabaseAdmin.from('profiles').update({
                is_verified: false,
                student_id_url: imageUrl,
                identity_verification_status: 'FLAGGED_FOR_MANUAL_REVIEW',
                internal_admin_notes: `AI Flagged: ${reviewReason}. Routed to Admin HQ Queue.`
            }).eq('id', userId);

            await supabaseAdmin.from('student_accounts').update({
                student_id_url: imageUrl,
                is_approved: false
            }).eq('id', userId);

            await createNotification(
                userId,
                "ID Flagged for Admin Review 📋",
                `Our automated system could not completely verify your ID (${reviewReason}). It has been forwarded to Admin HQ Account Queue for manual review.`,
                "/dashboard/student?tab=profile",
                "VERIFICATION_FLAGGED"
            );

            return {
                success: true,
                approved: false,
                forwardedToAdmin: true,
                reason: reviewReason
            };
        }

    } catch (e: any) {
        console.error("AI Verification error:", e);

        // Fallback: don't leave student stranded; safely route to Admin HQ Account Queue
        await supabaseAdmin.from('profiles').update({
            student_id_url: imageUrl,
            is_verified: false,
            identity_verification_status: 'FLAGGED_FOR_MANUAL_REVIEW',
            internal_admin_notes: `AI Bot encountered an error (${e?.message || 'unknown'}). Forwarded to Admin HQ for manual check.`
        }).eq('id', userId);

        await supabaseAdmin.from('student_accounts').update({
            student_id_url: imageUrl,
            is_approved: false
        }).eq('id', userId);

        await createNotification(
            userId,
            "ID Queued for Admin Review 📋",
            "Your student ID was received and forwarded to our Admin team at HQ for manual verification.",
            "/dashboard/student?tab=profile",
            "VERIFICATION_FLAGGED"
        );

        return { success: true, approved: false, forwardedToAdmin: true, reason: "Forwarded to Admin HQ for manual check" };
    }
}

