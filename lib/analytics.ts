import { createClient } from '@/lib/supabase/client';

export type EventType = 'impression' | 'view' | 'lead' | 'custom_offer';

let impressionQueue: { property_id: string; user_id?: string }[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

const BATCH_INTERVAL = 5000; // Send impressions every 5 seconds

/**
 * Tracks property events (impression, view, lead, custom_offer)
 */
export async function trackPropertyEvent(
    property_id: string,
    event_type: EventType,
    user_id?: string
) {
    if (typeof window === 'undefined') return; // Only track on client

    // Session storage check for spam prevention (views and leads)
    if (event_type === 'view' || event_type === 'lead') {
        const key = `tracked_${event_type}_${property_id}`;
        const lastTracked = sessionStorage.getItem(key);
        
        if (lastTracked) {
            const timeSince = Date.now() - parseInt(lastTracked, 10);
            if (timeSince < 60000) {
                // Prevent duplicate tracking within 60 seconds
                return;
            }
        }
        sessionStorage.setItem(key, Date.now().toString());
    }

    if (event_type === 'impression') {
        impressionQueue.push({ property_id, user_id });

        if (!batchTimeout) {
            batchTimeout = setTimeout(flushImpressions, BATCH_INTERVAL);
        }
        return;
    }

    // Instant insert for views and leads
    const supabase = createClient();
    try {
        await supabase.from('property_analytics').insert({
            property_id,
            event_type,
            user_id: user_id || null,
        });
    } catch (e) {
        console.error(`Failed to track ${event_type}`, e);
    }
}

/**
 * Flushes the impression queue to Supabase
 */
async function flushImpressions() {
    if (impressionQueue.length === 0) return;

    const supabase = createClient();
    const batch = [...impressionQueue].map(item => ({
        ...item,
        event_type: 'impression',
        user_id: item.user_id || null,
    }));
    impressionQueue = [];
    batchTimeout = null;

    try {
        await supabase.from('property_analytics').insert(batch);
    } catch (e) {
        console.error('Failed to batch track impressions', e);
    }
}

/**
 * Tracks search parameters from the main search bar
 */
export async function trackSearch(searchData: {
    search_term?: string;
    category?: string;
    min_budget?: number;
    max_budget?: number;
    location?: string;
}) {
    if (typeof window === 'undefined') return;
    
    // Prevent tracking empty searches
    if (!searchData.search_term && !searchData.category && !searchData.location) return;

    const supabase = createClient();
    try {
        await supabase.from('search_logs').insert({
            search_term: searchData.search_term || null,
            category: searchData.category || null,
            min_budget: searchData.min_budget || null,
            max_budget: searchData.max_budget || null,
            location: searchData.location || null,
        });
    } catch (e) {
        console.error('Failed to track search', e);
    }
}
