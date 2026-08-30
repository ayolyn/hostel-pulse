"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const getAdminClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

export async function createBlogPost(payload: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    image_url: string;
    read_time: string;
}) {
    try {
        const adminClient = getAdminClient();

        const { error } = await adminClient
            .from("blog_posts")
            .insert({
                title: payload.title,
                excerpt: payload.excerpt,
                content: payload.content,
                category: payload.category,
                image_url: payload.image_url,
                read_time: payload.read_time,
            });

        if (error) {
            console.error("Failed to create blog post:", error);
            return { error: error.message };
        }

        revalidatePath("/blog");
        return { success: true };
    } catch (err: any) {
        return { error: "An unexpected error occurred." };
    }
}
