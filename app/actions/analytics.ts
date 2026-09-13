"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackPropertyEvent(propertyId: string, eventType: 'view' | 'lead' | 'impression') {
    try {
        const supabase = await createClient();
        
        // This is safe to run anonymously, so we don't strictly require a user
        const { error } = await supabase
            .from("property_analytics")
            .insert({
                property_id: propertyId,
                event_type: eventType
            });

        if (error) {
            console.error("Error tracking analytics:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Exception in trackPropertyEvent:", err);
        return { success: false, error: err.message };
    }
}

export async function trackSearchEvent(params: {
    query?: string;
    area?: string;
    propertyType?: string;
    minBudget?: number;
    maxBudget?: number;
    budgetType?: string;
    resultsCount: number;
}) {
    try {
        const supabase = await createClient();
        await supabase.from('search_analytics').insert({
            query: params.query || null,
            area: params.area || null,
            property_type: params.propertyType || null,
            min_budget: params.minBudget || null,
            max_budget: params.maxBudget || null,
            budget_type: params.budgetType || 'total',
            results_count: params.resultsCount
        });
        return { success: true };
    } catch (err: any) {
        console.error("Exception in trackSearchEvent:", err);
        return { success: false, error: err.message };
    }
}