'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthProvider';

interface SavedContextType {
    savedIds: string[];
    isSaved: (propertyId: string) => boolean;
    toggleSave: (propertyId: string) => Promise<void>;
    savedCount: number;
    isLoading: boolean;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export function SavedProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const supabase = createClient();
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSaved = useCallback(async () => {
        if (!user) {
            setSavedIds([]);
            setIsLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('saved_properties')
            .select('property_id')
            .eq('student_id', user.id);

        if (!error && data) {
            setSavedIds(data.map((item: any) => item.property_id));
        }
        setIsLoading(false);
    }, [user, supabase]);

    useEffect(() => {
        fetchSaved();

        // Real-time subscription
        if (user) {
            const channel = supabase
                .channel('saved_changes')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'saved_properties',
                    filter: `student_id=eq.${user.id}`
                }, () => {
                    fetchSaved();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, supabase, fetchSaved]);

    const isSaved = (propertyId: string) => savedIds.includes(propertyId);

    const toggleSave = async (propertyId: string) => {
        if (!user) {
            alert('Please sign in to save properties.');
            return;
        }

        if (isSaved(propertyId)) {
            // Unsave
            const { error } = await supabase
                .from('saved_properties')
                .delete()
                .eq('student_id', user.id)
                .eq('property_id', propertyId);
            
            if (!error) {
                setSavedIds(prev => prev.filter(id => id !== propertyId));
            }
        } else {
            // Save
            const { error } = await supabase
                .from('saved_properties')
                .insert({
                    student_id: user.id,
                    property_id: propertyId
                });
            
            if (!error) {
                setSavedIds(prev => [...prev, propertyId]);
            }
        }
    };

    return (
        <SavedContext.Provider value={{
            savedIds,
            isSaved,
            toggleSave,
            savedCount: savedIds.length,
            isLoading
        }}>
            {children}
        </SavedContext.Provider>
    );
}

export function useSaved() {
    const context = useContext(SavedContext);
    if (context === undefined) {
        throw new Error('useSaved must be used within a SavedProvider');
    }
    return context;
}
