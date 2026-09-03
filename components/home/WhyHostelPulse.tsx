"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, PlaySquare, Wallet, Star } from "lucide-react";
import Image from "next/image";

export function WhyHostelPulse() {
  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Aggressive Direct-Response Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            Stop paying agents for <br className="hidden md:block"/>hostels you haven't seen.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            We eliminated the risk of renting in Ogbomoso. If the room doesn't match the video, or the agent doesn't show up, you get <span className="text-emerald-500 font-black">100% of your money back</span>. Instantly. No stories.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Escrow Card */}
          <div className="lg:col-span-2 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Hold the Cash.</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                Your rent stays locked in our secure escrow vault. The agent doesn't smell a single kobo until you physically inspect the room and hold the keys in your hand. 
              </p>
            </div>
            
            {/* Visual Mockup inside Card */}
            <div className="relative z-10 bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-xl max-w-sm mt-auto self-end md:-mr-4 md:-mb-4 transform rotate-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Escrow Vault</span>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">LOCKED</span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">?150,000</div>
              <div className="text-sm text-gray-500 mb-4">Awaiting your approval...</div>
              <div className="w-full h-12 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
          </div>

          <div className="flex flex-col gap-6">
            
            {/* Raw Videos Card */}
            <div className="flex-1 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5">
                  <PlaySquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">No Catfishing.</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Stop wasting transport fare on fake pictures. Every listing requires an unedited raw video walkthrough. What you see is literally what you get.
                </p>
              </div>
            </div>

            {/* Refund Card */}
            <div className="flex-1 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5">
                  <Wallet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Zero Risk Refunds.</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Agent didn't show up? Room looks different? Tap one button and your money bounces right back to your wallet. No arguments.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Testimonial Snippet */}
        <div className="mt-12 flex items-center gap-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 p-6 rounded-3xl w-max max-w-full">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white dark:border-[#0a0a0a] overflow-hidden">
                <Image src={"https://i.pravatar.cc/100?img=" + (i + 10)} alt="Student" width={40} height={40} />
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />)}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-300">
              Trusted by <span className="font-bold">5,000+</span> LAUTECH students.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
