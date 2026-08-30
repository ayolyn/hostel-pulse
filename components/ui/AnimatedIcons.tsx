"use client";

import { motion } from "framer-motion";

export function SuccessIcon({ size = 64, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.div
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute w-full h-full bg-green-500/20 rounded-full blur-xl"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10"
      >
        <motion.path
          d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
          stroke="#16a34a"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        <motion.path
          d="M22 4L12 14.01l-3-3"
          stroke="#16a34a"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

export function ErrorIcon({ size = 64, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.div
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.6, 0.2] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="absolute w-full h-full bg-red-500/20 rounded-full blur-xl"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10"
      >
        <motion.path
          d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"
          stroke="#ef4444"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <motion.path
          d="M15 9l-6 6"
          stroke="#ef4444"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
        />
        <motion.path
          d="M9 9l6 6"
          stroke="#ef4444"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

export function EmptyHouseIcon({ size = 64, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="relative z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* House Outline */}
          <motion.path
            d="M3 10L12 3l9 7v11H3V10z"
            stroke="#9ca3af" // Gray
            strokeWidth="1.5"
            strokeDasharray="4 4" // Dashed line for "empty" feel
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* Question mark inside */}
          <motion.path
            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
            stroke="#9ca3af"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          />
          <motion.circle
            cx="12"
            cy="17"
            r="1"
            fill="#9ca3af"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 2, type: "spring" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
