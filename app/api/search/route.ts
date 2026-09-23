import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Public read-only Supabase client for AI agent search
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

        // Text search by location/title
        if (q) {
            query = query.or(`location.ilike.%${q}%,title.ilike.%${q}%`);
        }

        // Filter by category (Hostel, Hotel, Shop, etc.)
        if (category) {
            query = query.ilike("category", `%${category}%`);
        }

        // Filter by listing type (rent, shortlet, buy)
        if (listing_type) {
            query = query.eq("listing_type", listing_type);
        }

        // Filter by max price
        if (max_price) {
            query = query.lte("price", parseInt(max_price));
        }

        const { data, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: "Search failed" }, { status: 500 });
        }

        // Shape results for AI consumption
        const results = (data || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            location: p.location,
            price: p.price,
            listing_type: p.listing_type,
            category: p.category,
            room_type: p.room_type || null,
            available_units: p.available_units || null,
            images: Array.isArray(p.images) ? p.images.slice(0, 3) : [],
            is_verified: p.is_verified || false,
            agent_name: p.agent_accounts?.full_name || p.landlord_accounts?.business_name || null,
            property_url: `https://hostelpulse.app/property/${p.id}`,
        }));

        // Build the corresponding search URL for the user to click
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        const basePath = listing_type === "shortlet" ? "/shortlet" : listing_type === "buy" ? "/buy" : "/rent";
        const search_url = `https://hostelpulse.app${basePath}?${params.toString()}`;

        return NextResponse.json(
            { results, total: results.length, search_url },
            {
                status: 200,
                headers: {
                    // Allow AI agents to call this endpoint
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                },
            }
        );
    } catch (err) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Handle CORS preflight for AI agent calls
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
