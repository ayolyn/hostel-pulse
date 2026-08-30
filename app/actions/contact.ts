"use server";

import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/email/resend";

export async function submitContactForm(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        if (!name || !email || !subject || !message) {
            return { error: "All fields are required." };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Insert into Supabase
        const { error: dbError } = await supabase
            .from("contact_messages")
            .insert({ name, email, subject, message });

        if (dbError) {
            console.error("Contact Form Insert Error:", dbError);
        }

        // 2. Send email via Resend
        if (process.env.RESEND_API_KEY) {
            const adminEmail = process.env.RESEND_FROM_EMAIL || "juliusayolyn@gmail.com";
            
            await resend.emails.send({
                from: "HostelPulse <onboarding@resend.dev>",
                to: adminEmail,
                subject: "New Inquiry: " + subject,
                html: "<h2>New Contact Form Submission</h2><p><strong>Name:</strong> " + name + "</p><p><strong>Email:</strong> " + email + "</p><p><strong>Subject:</strong> " + subject + "</p><br/><p><strong>Message:</strong></p><p>" + message + "</p>"
            });
        }

        return { success: true };
    } catch (err) {
        console.error("Contact form exception:", err);
        return { error: "An unexpected error occurred." };
    }
}
