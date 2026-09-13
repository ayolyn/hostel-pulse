"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, PlaySquare, Wallet, Star, MapPin } from "lucide-react";
import Image from "next/image";

export function WhyHostelPulse() {
  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Problem Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
            Stop paying for <br className="hidden md:block"/>hostels you haven't seen.
          </h2>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            Finding accommodation shouldn't mean paying inspection fees, entering random streets, or trusting pictures that don't match the room. HostelPulse helps you discover real student accommodation around Ogbomoso before you make the trip.
          </p>
          <div className="mt-8">
            <a href="/rent" className="bg-black dark:bg-[#BEF264] text-white dark:text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm inline-block shadow-lg hover:scale-105 transition-transform">
              Explore Hostels
            </a>
          </div>
        </div>

        {/* Core Product Benefit Section */}
        <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 mb-8">
          <div className="mb-10 max-w-2xl">
            <h3 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">See the room before you waste the trip.</h3>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              Every listing gives you the information you need to decide whether it's worth visiting. Real videos. Real locations. Real prices.
            </p>
          </div>

          {/* Supported Listing Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#050505] p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
              <PlaySquare className="w-8 h-8 text-[#BEF264] mb-3" />
              <span className="font-bold text-gray-900 dark:text-white text-sm">Raw Walkthrough</span>
            </div>
            <div className="bg-white dark:bg-[#050505] p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
              <MapPin className="w-8 h-8 text-[#BEF264] mb-3" />
              <span className="font-bold text-gray-900 dark:text-white text-sm">Location</span>
            </div>
            <div className="bg-white dark:bg-[#050505] p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
              <Wallet className="w-8 h-8 text-[#BEF264] mb-3" />
              <span className="font-bold text-gray-900 dark:text-white text-sm">Price</span>
            </div>
            <div className="bg-white dark:bg-[#050505] p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
              <Star className="w-8 h-8 text-[#BEF264] mb-3" />
              <span className="font-bold text-gray-900 dark:text-white text-sm">Student Reviews</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-[2rem] p-8">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Verified before you visit.</h3>
            <p className="text-gray-600 dark:text-gray-400">See what you're actually going to visit before spending your time and transport money. We check listings so you don't have to blindly trust.</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/10 rounded-[2rem] p-8">
            <PlaySquare className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No edited photos.</h3>
            <p className="text-gray-600 dark:text-gray-400">We require agents to upload raw, unedited video walkthroughs of the hostel rooms. What you see on your screen is what you'll see in person.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
