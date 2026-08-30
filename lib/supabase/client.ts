import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase browser client — for use in Client Components ('use client').
 */
let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Supabase browser client — for use in Client Components ('use client').
 * Returns a singleton instance to prevent redundant connections and re-renders.
 */
export function createClient() {
    if (client) return client;

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return client;
}
