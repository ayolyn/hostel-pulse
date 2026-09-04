"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const fallbackHostels = [
  {
    id: "mock1",
    title: "Premium Self-Con with Pop & Wardrobe",
    location: "Under-G, Ogbomoso",
    price: 180000,
    main_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    is_verified: true,
  },
  {
    id: "mock2",
    title: "Standard Room in a Gated Compound",
    location: "Adenike Area, Ogbomoso",
    price: 120000,
    main_image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    is_verified: true,
  },
  {
    id: "mock3",
    title: "Luxury 2-Bedroom Flat",
    location: "Stadium Gate, Ogbomoso",
    price: 350000,
    main_image: "https://images.unsplash.com/photo-1502672260266-1c1e52504437?q=80&w=800&auto=format&fit=crop",
    bedrooms: 2,
    bathrooms: 2,
    is_verified: true,
  }
];

export function FeaturedListings() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, location, price, main_image, bedrooms, bathrooms, is_verified')
          .eq('listing_type', 'rent')
          .in('status', ['active', 'under_inspection'])
          .order('created_at', { ascending: false })
          .limit(3);

        if (error || !data || data.length === 0) {
          setHostels(fallbackHostels);
        } else {
          let finalData = [...data];
          if (finalData.length < 3) {
            finalData = [...finalData, ...fallbackHostels.slice(0, 3 - finalData.length)];
          }
          setHostels(finalData);
        }
      } catch (err) {
        setHostels(fallbackHostels);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse flex flex-col md:flex-row justify-between mb-12 gap-4">
            <div className="w-1/2 h-8 bg-gray-200 dark:bg-white/10 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
               <div key={i} className="h-[400px] bg-gray-200 dark:bg-white/5 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
              Trending <span className="text-emerald-500">Hostels</span>
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              The most sought-after verified properties around campus this week.
            </p>
          </div>
          <Link href="/rent" className="flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
            View all properties <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hostels.map((hostel, i) => (
            <motion.div 
              key={hostel.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden shrink-0">
                <Image
                  src={hostel.main_image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800"}
                  alt={hostel.title || "Hostel Room"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {(hostel.is_verified || String(hostel.id).startsWith('mock')) && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur text-white px-4 py-2 rounded-xl text-lg font-black">
                  \u20A6{Number(hostel.price).toLocaleString()}<span className="text-sm font-normal text-gray-300">/yr</span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                  <MapPin className="w-4 h-4 shrink-0" /> {hostel.location || 'Ogbomoso'}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 line-clamp-2">
                  {hostel.title}
                </h3>
                
                <div className="mt-auto flex items-center gap-6 text-gray-600 dark:text-gray-300 mb-6 border-t border-gray-100 dark:border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{hostel.bedrooms || 1} Bed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{hostel.bathrooms || 1} Bath</span>
                  </div>
                </div>

                <Link href={String(hostel.id).startsWith('mock') ? '/rent' : ('/rent/' + hostel.id)} className="block w-full py-3 text-center bg-gray-100 dark:bg-white/5 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-gray-900 dark:text-white rounded-xl font-bold transition-colors">
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
