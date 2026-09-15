"use client";

import React from "react";
import { ShieldCheck, PlaySquare, Wallet, Star, MapPin, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

export function WhyHostelPulse() {
  return (
    <section className="py-16 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Visual Storytelling Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              Stop paying for hostels you haven't seen.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium">
              Finding accommodation shouldn't mean paying inspection fees to agents just to see a room you don't like. We verify the location and demand unedited video walkthroughs before a listing goes live.
            </p>
            <Link 
                href="/rent"
                className="inline-flex items-center gap-2 bg-[#BEF264] hover:bg-[#d9f99d] text-black px-6 py-3 rounded-xl font-bold text-sm uppercase transition-all"
            >
                Explore verified hostels <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="relative">
            {/* Fake UI Stack to show the flow */}
            <div className="relative flex flex-col gap-4 bg-gray-50 dark:bg-[#111] p-6 rounded-3xl border border-gray-200 dark:border-white/10">
              {/* Step 1: Search */}
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <Search className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">Search Ogbomoso areas</div>
                  <div className="text-xs text-gray-500">Under-G, Stadium, Adenike...</div>
                </div>
              </div>
              {/* Step 2: Listing Details */}
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border-l-4 border-[#BEF264]">
                <PlaySquare className="w-6 h-6 text-[#BEF264] shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">Watch unedited walkthrough</div>
                  <div className="text-xs text-gray-500">Every corner of the room, raw and real. No wide-angle tricks.</div>
                </div>
              </div>
              {/* Step 3: Verified Location */}
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">Verified Location</div>
                  <div className="text-xs text-gray-500">HostelPulse confirms the address before it goes live.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* See the room before you waste the trip */}
        <div className="border-t border-gray-200 dark:border-white/10 pt-16">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">See the room before you waste the trip.</h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Every listing includes what you actually need to make a decision.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
              <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">Feature</div>
              <PlaySquare className="w-6 h-6 text-gray-900 dark:text-white mb-3" />
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">Raw Walkthroughs</div>
              <div className="text-sm text-gray-500">No wide-angle lenses. Real videos of the actual condition.</div>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
              <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">Verification</div>
              <ShieldCheck className="w-6 h-6 text-gray-900 dark:text-white mb-3" />
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">Checked by us</div>
              <div className="text-sm text-gray-500">Agents are vetted before posting. Address confirmed.</div>
            </div>

            <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
              <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">Price</div>
              <Wallet className="w-6 h-6 text-gray-900 dark:text-white mb-3" />
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">Total Cost</div>
              <div className="text-sm text-gray-500">See rent, agency, and agreement fees transparently upfront.</div>
            </div>

            <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
              <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">Feedback</div>
              <Star className="w-6 h-6 text-gray-900 dark:text-white mb-3" />
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">Student Reviews</div>
              <div className="text-sm text-gray-500">Read what others say about the environment and landlord.</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
