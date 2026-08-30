"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AuthHashHandler — Mounted in the root layout.
 * Detects Supabase auth hash fragments (e.g. password recovery tokens)
 * and redirects to the appropriate handler page.
 */
export function AuthHashHandler() {
    const router = useRouter();

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        const params = new URLSearchParams(hash.slice(1)); // strip the leading #
        const type = params.get('type');

        if (type === 'recovery') {
            // Preserve the full hash so the reset page can use the token
            router.push(`/auth/reset-password${hash}`);
        }
    }, [router]);

    return null; // purely behavioral, no UI
}
