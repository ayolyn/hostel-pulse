import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import AdminCaseRoomClient from './AdminCaseRoomClient';

export default async function AdminCaseRoom({ params }: { params: { escrow_id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/join');
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tx, error: txError } = await supabaseAdmin
        .from('escrow_transactions')
        .select('*')
        .eq('id', params.escrow_id)
        .single();

    if (txError || !tx) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0F172A] text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest">Database Error</h1>
                    <p className="text-gray-400 font-bold uppercase p-10">{txError?.message || txError?.details || txError?.hint || 'Row not found'}</p>
                    <p className="text-xs text-gray-500">Could not find escrow transaction ID: {params.escrow_id}</p>
                </div>
            </div>
        );
    }

    const resolvedBuyerId = tx.payer_id || tx.buyer_id;
    const resolvedSellerId = tx.payee_id || tx.seller_id;

    const { data: buyerProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', resolvedBuyerId).single();
    const { data: sellerProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', resolvedSellerId).single();

    let marketListing: any = null;
    if (tx.listing_id) {
        const { data: ml } = await supabaseAdmin.from('market_listings').select('title, price').eq('id', tx.listing_id).single();
        marketListing = ml;
    } else if (tx.property_id) {
        const { data: p } = await supabaseAdmin.from('properties').select('title, price').eq('id', tx.property_id).single();
        marketListing = p;
    }

    const safeTx = { 
        ...tx, 
        payer: buyerProfile, 
        payee: sellerProfile,
        payer_id: resolvedBuyerId,
        payee_id: resolvedSellerId,
        market_listings: marketListing
    };

    const { data: messages } = await supabaseAdmin
        .from('dispute_messages')
        .select('*')
        .eq('escrow_id', params.escrow_id)
        .order('created_at', { ascending: true });

    return (
        <AdminCaseRoomClient 
            escrowId={params.escrow_id}
            initialTransaction={safeTx}
            initialMessages={messages || []}
            currentUser={user}
        />
    );
}
