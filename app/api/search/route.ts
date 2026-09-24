import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Mini NLP Router to understand intent without costing API money
function extractIntent(query: string) {
    const q = query.toLowerCase();
    const intent: any = { terms: [], isCheap: false, isExpensive: false, roomType: null };
    
    // Price intent
    if (q.includes("cheap") || q.includes("affordable") || q.includes("low cost")) {
        intent.isCheap = true;
    }
    if (q.includes("luxury") || q.includes("expensive") || q.includes("premium")) {
        intent.isExpensive = true;
    }

    // Room type intent
    if (q.includes("self con") || q.includes("self-con") || q.includes("self contain")) {
        intent.roomType = "Self-Contain";
    } else if (q.includes("single room") || q.includes("one room")) {
        intent.roomType = "Single Room";
    } else if (q.includes("flat") || q.includes("apartment")) {
        intent.roomType = "Apartment/Flat";
    }

    // Extract core location/keywords (remove fluff words)
    const stopWords = ["near", "in", "at", "around", "a", "an", "the", "for", "cheap", "affordable", "luxury", "me", "find", "looking", "want", "need"];
    const words = q.split(" ").filter(w => !stopWords.includes(w) && w.length > 2);
    
    intent.terms = words;
    return intent;
}

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;

    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const listing_type = searchParams.get("listing_type") || "";
    const max_price = searchParams.get("max_price");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    try {
        let query = supabase
            .from("properties")
            .select("id, title, location, price, listing_type, category, room_type, available_units, images, is_verified, agent_accounts(full_name), landlord_accounts(business_name)")
            .eq("is_active", true)
            .limit(limit);

        if (q) {
            const intent = extractIntent(q);
            
            if (intent.roomType) {
                query = query.eq('room_type', intent.roomType);
            }
            
            if (intent.terms.length > 0) {
                // Build a dynamic OR query across title and location
                const orQueries = intent.terms.map((term: string) => `title.ilike.%${term}%,location.ilike.%${term}%,description.ilike.%${term}%`);
                query = query.or(orQueries.join(','));
            }

            if (intent.isCheap) {
                query = query.order("price", { ascending: true });
            } else if (intent.isExpensive) {
                query = query.order("price", { ascending: false });
            } else {
                query = query.order("created_at", { ascending: false });
            }
        } else {
            query = query.order("created_at", { ascending: false });
        }

        if (category) {
            query = query.ilike("category", `%${category}%`);
        }
        
        if (listing_type) {
            query = query.ilike("listing_type", `%${listing_type}%`);
        }

        if (max_price) {
            query = query.lte("price", parseInt(max_price));
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            results: data,
            count: data.length,
            metadata: {
                message: "Here are the top matches based on your search intent."
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
