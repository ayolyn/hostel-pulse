"use client";

import { useEffect, useState } from "react";
import { MapPin, Bed, Bath, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function FeaturedListings() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, location, price, images, bedrooms, bathrooms, verification_status')
          .eq('listing_type', 'rent')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
               <div key={i} className="h-[360px] bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no data, render an empty state as requested (no fabricated data)
  if (hostels.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">More verified listings coming soon</h3>
            <p className="text-gray-500 mb-6">Our agents are currently verifying new properties in Ogbomoso.</p>
            <Link 
                href="/dashboard"
                className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
                List your property
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              Recently Verified
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
              Real properties ready for inspection.
            </p>
          </div>
          <Link href="/rent" className="flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-[#BEF264] transition-colors">
            View all properties <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => (
            <div 
              key={hostel.id}
              className="group bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 flex flex-col"
            >
              {/* 1. Image Priority */}
              <div className="relative h-52 overflow-hidden shrink-0 bg-gray-100 dark:bg-[#111]">
                {hostel.images && hostel.images[0] ? (
                  <Image
                    src={hostel.images[0]}
                    alt={hostel.title || "Property"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">No Image</div>
                )}
                
                {/* 4. Verification Badge */}
                {hostel.verification_status === "Verified" && (
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#BEF264]" /> VERIFIED
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                {/* 2. Price & 3. Location Area */}
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="text-xl font-black text-gray-900 dark:text-white">
                    {"\u20A6"}{Number(hostel.price).toLocaleString()}<span className="text-sm font-normal text-gray-500">/yr</span>
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                  {hostel.title}
                </h3>
                
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{hostel.location}</span>
                </div>
                
                {/* 5. Room Type / Attributes */}
                <div className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-[#111] p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-gray-400" />
                    <span>{hostel.bedrooms || 1} Bed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-gray-400" />
                    <span>{hostel.bathrooms || 1} Bath</span>
                  </div>
                </div>

                {/* 7. CTA */}
                <Link href={'/property/' + hostel.id} className="mt-auto block w-full py-3.5 text-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold transition-colors text-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
