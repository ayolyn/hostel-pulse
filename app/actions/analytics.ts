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
