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
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this image strictly. Is it a valid, official student ID card for LAUTECH (Ladoke Akintola University of Technology)? You must find the university name 'Ladoke Akintola University of Technology' or 'LAUTECH' clearly visible, along with a student photo. If ANY of these are missing, or if it is a random image, reply with exactly 'NO'. Only reply 'YES' if it is unmistakably a LAUTECH student ID." },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 10,
        });

        const answer = response.choices[0].message.content?.trim().toUpperCase();

        if (answer?.includes('YES')) {
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
