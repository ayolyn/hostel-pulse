"use server";

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';

export async function verifyStudentIdAuto(userId: string, imageUrl: string) {
    if (!process.env.OPENAI_API_KEY) {
        console.log("No OPENAI_API_KEY found, skipping auto-verification.");
        return { success: false, reason: "No API Key" };
    }

    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "You are a strict KYC bot for Ladoke Akintola University of Technology (LAUTECH). Inspect this image. Return a JSON object with a single boolean field 'approved'. It must be true ONLY if the image is an official LAUTECH student ID card, clearly showing the name of the university and a student photo. If it is a random picture, a picture of the sky, or any other ID, return false." },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 200,
        });

        const answerString = response.choices[0].message.content || '{}';
        const answer = JSON.parse(answerString);

        if (answer.approved === true) {

            // Auto-Approve
            await supabaseAdmin.from('student_accounts').update({ is_approved: true }).eq('id', userId);
            await supabaseAdmin.from('agent_accounts').update({ is_approved: true }).eq('id', userId);
            await supabaseAdmin.from('landlord_accounts').update({ is_approved: true }).eq('id', userId);
            await supabaseAdmin.from('profiles').update({ is_verified: true }).eq('id', userId);
            
            await createNotification(
                userId,
                "ID Verified Automatically ?",
                "Your LAUTECH student ID has been automatically verified by our AI system. You now have full access!",
                "/dashboard/student?tab=profile",
                "VERIFICATION_SUCCESS"
            );

            return { success: true, approved: true };
        } else {
            // Did not match YES
            await createNotification(
                userId,
                "ID Verification Pending ?",
                "Our automated system could not clearly read your LAUTECH student ID. It has been flagged for manual review by an Admin.",
                "/dashboard/student?tab=profile",
                "VERIFICATION_FAILED"
            );
            return { success: true, approved: false };
        }

    } catch (e) {
        console.error("AI Verification error:", e);
        return { success: false, reason: "AI Error" };
    }
}
