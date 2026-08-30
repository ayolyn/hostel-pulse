import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { action, listing_id, user_id } = await request.json();

        if (!user_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Query the user's wallet table
        const { data: walletData, error: walletError } = await supabaseAdmin
            .from('wallets')
            .select('balance')
            .eq('user_id', user_id)
            .single();

        if (walletError || !walletData) {
            return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        }

        const currentBalance = walletData.balance;

        if (action === 'flex_boost') {
            if (!listing_id) return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 });

            // Verify ownership of the listing
            const { data: listing, error: listingError } = await supabaseAdmin
                .from('market_listings')
                .select('seller_id')
                .eq('id', listing_id)
                .single();

            if (listingError || listing.seller_id !== user_id) {
                return NextResponse.json({ error: 'Unauthorized listing modification' }, { status: 403 });
            }

            if (currentBalance < 500) {
                return NextResponse.json({ error: 'INSUFFICIENT_FUNDS', balance: currentBalance }, { status: 400 });
            }

            // Deduct funds and log transaction
            await supabaseAdmin.from('wallets').update({ balance: currentBalance - 500 }).eq('user_id', user_id);
            await supabaseAdmin.from('transaction_ledger').insert({ user_id, type: 'market_boost', amount: -500, created_at: new Date() });
            
            // Set 48 hours interval
            const featuredUntil = new Date();
            featuredUntil.setHours(featuredUntil.getHours() + 48);

            await supabaseAdmin.from('market_listings').update({ 
                is_featured: true, 
                featured_until: featuredUntil.toISOString() 
            }).eq('id', listing_id);

            return NextResponse.json({ success: true, new_balance: currentBalance - 500 });

        } else if (action === 'subscribe_pro') {
            if (currentBalance < 3000) {
                return NextResponse.json({ error: 'INSUFFICIENT_FUNDS', balance: currentBalance }, { status: 400 });
            }

            // Deduct funds and log transaction
            await supabaseAdmin.from('wallets').update({ balance: currentBalance - 3000 }).eq('user_id', user_id);
            await supabaseAdmin.from('transaction_ledger').insert({ user_id, type: 'pro_subscription', amount: -3000, created_at: new Date() });
            
            // Set 30 days interval
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);

            await supabaseAdmin.from('profiles').update({ 
                subscription_tier: 'pro', 
                subscription_expiry: expiry.toISOString() 
            }).eq('id', user_id);

            return NextResponse.json({ success: true, new_balance: currentBalance - 3000 });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
