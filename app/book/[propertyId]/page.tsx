import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import MockCheckoutClient from "./MockCheckoutClient";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function BookPropertyPage({ params }: { params: { propertyId: string } }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/join");
    }

    // Fetch property details
    const { data: property, error } = await supabase
        .from('properties')
        .select(`
            *,
            landlord:landlord_accounts(business_name, logo_url),
            agent:agent_accounts(full_name, avatar_url)
        `)
        .eq('id', params.propertyId)
        .single();

    if (error || !property) {
        notFound();
    }

    const providerId = property.agent_id || property.landlord_id;
    const providerName = property.agent?.full_name || property.landlord?.business_name || "HostelPulse Verified Provider";
    const providerAvatar = property.agent?.avatar_url || property.landlord?.logo_url;

    // Calculate fees
    const price = Number(property.price);
    const legalFee = price * 0.05;
    const protectionFee = 1000;
    const totalAmount = price + legalFee + protectionFee;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="hidden md:block">
                <PublicHeader />
            </div>

            <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-100">
                <Link href={`/property/${property.id}`} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
                <h1 className="font-black uppercase tracking-widest text-sm">Checkout</h1>
                <div className="w-9" />
            </div>

            <main className="flex-1 max-w-3xl w-full mx-auto p-6 mt-4">
                <MockCheckoutClient 
                    propertyId={property.id}
                    propertyTitle={property.title}
                    propertyImage={property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2669'}
                    providerId={providerId}
                    providerName={providerName}
                    providerAvatar={providerAvatar}
                    basePrice={price}
                    legalFee={legalFee}
                    protectionFee={protectionFee}
                    totalAmount={totalAmount}
                    studentId={user.id}
                />
            </main>
        </div>
    );
}
