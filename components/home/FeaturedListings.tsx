"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PropertyCard from "@/components/ui/PropertyCard";

export function FeaturedListings() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, location, category, price, total_move_in_cost, images, verification_status, video_url, verified_walkthrough, status')
          .eq('listing_type', 'rent')
          .eq('is_active', true)
          .eq('status', 'active')
          .order('verified_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(4);

        if (!error && data && data.length > 0) {
          setHostels(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div className="w-1/3 h-8 bg-gray-200 dark:bg-white/10 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="h-[360px] bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (hostels.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight uppercase">
              Recently Verified
            </h2>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
              Real properties ready for inspection.
            </p>
          </div>
          <Link href="/rent?sort=recent" className="flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-[#BEF264] transition-colors text-sm uppercase tracking-widest bg-white py-3 px-5 rounded-xl border border-gray-100 shadow-sm">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hostels.map((hostel) => {
              const hasWalkthrough = Boolean(hostel.video_url && hostel.video_url !== 'null' && hostel.video_url !== 'undefined' && hostel.video_url.length > 5);
              
              return (
                <Link key={hostel.id} href={`/property/${hostel.id}`} className="block group">
                    <PropertyCard
                        id={hostel.id}
                        title={hostel.title}
                        location={hostel.location}
                        category={hostel.category}
                        price={`₦${Number(hostel.price).toLocaleString()}`}
                        totalMoveInCost={hostel.total_move_in_cost ? `₦${Number(hostel.total_move_in_cost).toLocaleString()}` : undefined}
                        verificationStatus={hostel.verification_status}
                        hasWalkthrough={hasWalkthrough}
                        isAvailable={hostel.status === 'active'}
                        image={(hostel.images && hostel.images.length > 0 && hostel.images[0] !== 'null') ? hostel.images[0] : '/placeholder.jpg'}
                    />
                </Link>
              );
          })}
        </div>
      </div>
    </section>
  );
}