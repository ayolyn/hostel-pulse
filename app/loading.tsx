"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    // Clean transparent overlay with strong blur
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-xl">
      
      <div className="relative flex items-center justify-center">
        {/* Soft glowing aura behind the icon */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute w-32 h-32 bg-[#22c55e]/20 rounded-full blur-2xl"
        />

        {/* Custom Hostel Pulse SVG Animation */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
        >
          {/* House Outline (The "Hostel") */}
          <motion.path
            d="M3 10L12 3l9 7v11H3V10z"
            stroke="#16a34a" // Rich green
            strokeWidth="1.5"
            initial={{ pathLength: 0, fill: "rgba(22, 163, 74, 0)" }}
            animate={{ 
              pathLength: 1, 
              fill: ["rgba(22, 163, 74, 0)", "rgba(22, 163, 74, 0.1)", "rgba(22, 163, 74, 0)"] 
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Heartbeat Line (The "Pulse") */}
          <motion.path
            d="M4 14h3.5l2 -5l3 10l2 -5h5.5"
            stroke="currentColor"
            className="text-gray-900 dark:text-white"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Pulsing Text */}
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mt-6 text-sm font-bold tracking-[0.2em] uppercase text-[#16a34a] drop-shadow-sm"
      >
        Hostel Pulse
      </motion.div>
    </div>
  );
}
