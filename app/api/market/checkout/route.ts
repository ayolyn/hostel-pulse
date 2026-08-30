export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notifications';
import { sendNotificationEmail } from '@/lib/email/resend';
import { BookingConfirmedEmail } from '@/components/emails/BookingConfirmedEmail';
import { render } from '@react-email/render';

export async function POST(req: Request) {
    try {
        const { listing_id } = await req.json();
        const supabase = await createClient();

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Get the session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the listing and validate status
        const { data: listing, error: listingError } = await supabase
            .from('market_listings')
            .select('*')
            .eq('id', listing_id)
            .single();

        if (listingError || !listing || listing.status !== 'active') {
            return NextResponse.json({ error: "Listing is no longer active or does not exist." }, { status: 400 });
        }

        if (listing.seller_id === user.id) {
            return NextResponse.json({ error: "You cannot buy your own item." }, { status: 400 });
        }

        // 3. Wallet Check
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Could not fetch wallet balance." }, { status: 400 });
        }

        const balance = profile.wallet_balance || 0;

        // Calculate service fee exactly like the frontend
        let serviceFee = 1000;
        if ((listing.category || '').toLowerCase().includes('appliance') || (listing.title || '').toLowerCase().includes('fridge')) {
            serviceFee = 1000;
        } else if (Number(listing.price) < 20000) {
            serviceFee = 500;
        } else if (Number(listing.price) > 50000) {
            serviceFee = Math.floor(Number(listing.price) * 0.025);
        }

        const totalCost = Number(listing.price) + serviceFee;

        if (balance < totalCost) {
            return NextResponse.json({ error: "Insufficient funds in wallet." }, { status: 400 });
        }

        // 4. The Escrow Execution
        // Deduct the item price + fee from the buyer's wallet balance
        const { error: deductError } = await supabase
            .from('profiles')
            .update({ wallet_balance: balance - totalCost })
            .eq('id', user.id);

        if (deductError) throw deductError;

        // Insert a new row into escrow_transactions
        const { error: escrowError } = await supabaseAdmin
            .from('escrow_transactions')
            .insert({
                payer_id: user.id,
                payer_type: 'student',
                payee_id: listing.seller_id,
                payee_type: 'student',
                listing_id: listing.id,
                amount: totalCost,
                status: 'pending'
            });

        if (escrowError) throw escrowError;

        // Decrement quantity atomically
        const { data: newQuantity, error: decrementError } = await supabaseAdmin
            .rpc('decrement_market_quantity', { listing_id_param: listing.id });

        if (decrementError || newQuantity === null) {
            const { data: currentListing } = await supabase.from('market_listings').select('quantity, status').eq('id', listing.id).single();
            if (!currentListing || currentListing.quantity <= 0 || currentListing.status !== 'active') {
                return NextResponse.json({ error: "Item is currently unavailable or sold out." }, { status: 400 });
            }
            throw decrementError || new Error("Failed to decrement quantity.");
        }

        // Update the market_listings row: Set status = 'sold' only if quantity drops to 0
        if (newQuantity <= 0) {
            const { error: updateError } = await supabaseAdmin
                .from('market_listings')
                .update({ status: 'sold' })
                .eq('id', listing.id);

            if (updateError) throw updateError;
        }

        // 5. Fire System Notifications
        // Notify Seller
        await createNotification(
            listing.seller_id,
            'New Sale!',
            'Your item was purchased and funds are locked in Escrow.',
            '/dashboard/student?tab=wallet',
            'new_sale'
        );

        // Notify Buyer
        await createNotification(
            user.id,
            'Checkout Successful',
            'Funds securely locked.',
            '/dashboard/student?tab=wallet',
            'new_sale'
        );

        // 6. Send Email Notification
        if (user.email) {
            const htmlBody = await render(BookingConfirmedEmail({ 
                propertyName: listing.title || 'Market Item',
                checkInDate: 'N/A (Market Purchase)',
                amount: totalCost.toLocaleString()
            }));
            
            await sendNotificationEmail(
                user.email,
                'Checkout Confirmed! 🎉',
                htmlBody
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Checkout API error:', error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
