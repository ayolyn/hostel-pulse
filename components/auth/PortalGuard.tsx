"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

interface PortalContextType {
    role: string | null;
    isSidebarOpen: boolean;
    isRetracted: boolean;
    toggleSidebar: () => void;
    toggleRetract: () => void;
    setSidebarOpen: (open: boolean) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [role, setRole] = useState<string | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isRetracted, setRetracted] = useState(false);
    const supabase = createClient();
    const pathname = usePathname();

    useEffect(() => {
        async function fetchRole() {
            if (!user) return;
            const { data } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();
            if (data) setRole(data.role);
        }
        fetchRole();
    }, [user, supabase]);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [pathname]);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const toggleRetract = () => setRetracted(!isRetracted);

    return (
        <PortalContext.Provider value={{ 
            role, 
            isSidebarOpen, 
            isRetracted, 
            toggleSidebar, 
            toggleRetract,
            setSidebarOpen
        }}>
            {children}
        </PortalContext.Provider>
    );
}

export const usePortal = () => {
    const context = useContext(PortalContext);
    if (!context) throw new Error('usePortal must be used within a PortalProvider');
    return context;
};

export function PortalGuard({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
    const { role } = usePortal();
    const router = useRouter();

    useEffect(() => {
        if (role && requiredRole && role !== requiredRole) {
            router.push('/dashboard');
        }
    }, [role, requiredRole, router]);

    if (requiredRole && role !== requiredRole) return null;

    return <>{children}</>;
}
