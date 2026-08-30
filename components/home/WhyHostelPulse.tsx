'use client';

import React, { useState } from "react";
import { Lock, Unlock, PlayCircle, ShieldCheck, Star, MapPin } from "lucide-react";

export function WhyHostelPulse() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-20 bg-[#0a0a0a] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Never Get Scammed on <span className="text-green-400">Rent Again.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            No fake agents. No unnecessary inspection fees. Zero risk until you hold the keys.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          
          {/* Main Card: Escrow Protection (Spans 2 columns on Desktop) */}
          <div 
            className="md:col-span-2 md:row-span-2 relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden group flex flex-col justify-end"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Interactive Animated Escrow Pill */}
            <div className="absolute top-8 left-8 right-8 flex justify-center items-center">
              <div className={"transition-all duration-500 ease-in-out flex items-center gap-3 px-6 py-4 rounded-full border shadow-xl ${isHovered ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}"}>
                 {isHovered ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                 <span className="font-semibold text-sm md:text-base">
                   {isHovered ? "Funds Released on Key Handover" : "Funds Locked in Secure Escrow"}
                 </span>
              </div>
            </div>

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">100% Escrow Protection</h3>
              <p className="text-gray-400 max-w-md">
                Your money stays locked securely in our system until you inspect the room in person and collect your keys.
              </p>
            </div>
          </div>

          {/* Card 2: Video Walkthroughs */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col justify-end group">
            {/* Mockup Video Element Background */}
            <div className="absolute -top-12 -right-8 w-48 h-48 bg-gradient-to-br from-green-400/10 to-transparent rounded-2xl border border-white/5 flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <PlayCircle className="w-12 h-12 text-white/10 group-hover:text-green-400/50 transition-colors duration-300" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Raw Video Walkthroughs</h3>
              <p className="text-gray-400 text-sm">
                No filtered pictures. Watch unedited video walkthroughs of the exact room, bathroom, and light situation.
              </p>
            </div>
          </div>

          {/* Card 3: Direct to Verified Agents */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 backdrop-blur-md flex flex-col justify-end">
            <h3 className="text-xl font-bold mb-2">Find in Minutes</h3>
            <p className="text-gray-400 text-sm mb-4">
              Skip endless middle-men taking ?2,000 just to show you an already occupied room.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">Under-G</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">Adenike</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">Stadium Gate</span>
            </div>
          </div>

        </div>

        {/* Social Proof Review Section */}
        <div className="mt-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center gap-8">
          
          {/* Avatar Stack & Rating */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-start">
            <div className="flex -space-x-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-[#0a0a0a]" />
              <div className="w-12 h-12 rounded-full bg-gray-600 border-2 border-[#0a0a0a]" />
              <div className="w-12 h-12 rounded-full bg-gray-500 border-2 border-[#0a0a0a]" />
              <div className="w-12 h-12 rounded-full bg-green-500 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold text-black">+1k</div>
            </div>
            <div className="flex text-yellow-400 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-gray-400 font-medium">Trusted by LAUTECH students</p>
          </div>

          {/* Featured Review */}
          <div className="flex-grow md:pl-8 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-400/20 text-green-400 flex items-center justify-center font-bold">BA</div>
              <div>
                <p className="font-bold text-sm">Boluwatife A.</p>
                <div className="flex items-center text-xs text-green-400 mt-0.5">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified Tenant
                </div>
              </div>
            </div>
            <p className="text-gray-300 italic">
              "Found my self-con in 2 days without paying 4 different agents inspection fees. Escrow made it completely stress-free."
            </p>
            <div className="flex items-center text-xs text-gray-500 mt-3">
              <MapPin className="w-3 h-3 mr-1" /> Greenland Villa, Under-G
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
