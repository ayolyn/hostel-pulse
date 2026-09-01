'use client';

import { motion } from 'framer-motion';
import { Home, Sparkles, Building2, ShieldCheck, Zap } from 'lucide-react';

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className = '' }: SplineSceneProps) {
  return (
    <div className={`${className} relative group h-full min-h-[500px]`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full h-full relative"
      >
        {/* Abstract 3D-like composition with better visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#BEF264]/10 via-transparent to-emerald-500/10 rounded-[4rem] border border-neutral-200 dark:border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
          
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 opacity-30">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-[#BEF264]/40 rounded-full blur-[100px]"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-[100px]"
            />
          </div>

          {/* Floating Feature Cards (Simulating 3D depth) */}
          <div className="absolute inset-0 flex items-center justify-center">
            
            {/* Main Central Icon */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative p-6 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] z-20 flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#BEF264] to-[#86b333] rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(190,242,100,0.4)]">
                <Home size={56} className="text-black" />
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#BEF264]/20 rounded-full border border-[#BEF264]/30 text-[#BEF264] text-xs font-black uppercase tracking-widest">
                  <Sparkles size={14} />
                  Live View 3D
                </div>
                <h3 className="text-neutral-900 dark:text-white text-xl sm:text-2xl font-black tracking-tighter uppercase">Virtual Hub</h3>
              </div>
            </motion.div>

            {/* Orbiting Elements */}
            <motion.div
              animate={{ 
                x: [0, 40, 0],
                y: [0, 30, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-20 p-4 bg-white/20 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl z-30"
            >
              <ShieldCheck className="text-[#BEF264] w-8 h-8" />
            </motion.div>

            <motion.div
              animate={{ 
                x: [0, -50, 0],
                y: [0, -40, 0],
                rotate: [0, -15, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-32 left-16 p-6 bg-white/20 dark:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl z-30 flex items-center gap-4"
            >
               <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                 <Zap className="text-white w-5 h-5" />
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase opacity-50 dark:text-white">Speed</span>
                 <span className="text-xs font-bold dark:text-white">Instant Booking</span>
               </div>
            </motion.div>

            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                y: [0, 50, 0]
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-32 left-32 p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/10 z-10"
            >
              <Building2 className="text-white/40 w-12 h-12" />
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
