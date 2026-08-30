'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    role: string | null;
    signInWithGoogle: (role: string) => Promise<void>;
    signOut: () => Promise<void>;
    /** @deprecated Use signInWithGoogle instead. Kept for component backward compatibility. */
    signIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    // Fetch the user's role from user_roles table.
    // Uses maybeSingle() to gracefully return null if the user hasn't onboarded yet.
    const fetchRole = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();
        setRole(data?.role ?? null);
    }, [supabase]);

    useEffect(() => {
        // Hydrate session on load
        supabase.auth.getSession().then((response: any) => {
            const session = response.data.session;
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchRole(session.user.id);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchRole(session.user.id);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchRole]);

    /**
     * Initiate Google OAuth sign-in.
     * The `role` is stored in Supabase redirectTo params and picked up
     * by the /auth/callback route after OAuth completes.
     */
    const signInWithGoogle = async (selectedRole: string) => {
        // Store the intended role in localStorage so the callback can pick it up
        localStorage.setItem('HOSTELPULSE_pending_role', selectedRole);

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setRole(null);
        router.push('/auth?mode=signin');
    };


    // Legacy adapter for components using the old signIn()
    const signIn = () => {
        signInWithGoogle('student');
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isLoggedIn: !!user,
            isLoading,
            role,
            signInWithGoogle,
            signOut,
            signIn,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
