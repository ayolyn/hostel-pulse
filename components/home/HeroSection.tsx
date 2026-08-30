'use client';

import { motion } from 'framer-motion';
import { HeroHeadline } from './HeroHeadline';
import { SplineScene } from '../ui/SplineScene';
import { Spotlight } from '../ui/Spotlight';
import { useRouter } from 'next/navigation';

export function HeroSection() {
    const router = useRouter();
    return (
        <section className="relative w-full min-h-[90vh] bg-white dark:bg-black overflow-hidden pt-32 pb-12 transition-colors duration-300">
            <div className="absolute inset-0 dark:block hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#BEF264" />
            </div>

            <div className="absolute inset-0 dark:hidden block">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#BEF264]/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -ml-48 -mb-48" />
            </div>

            <div className="max-w-7xl mx-auto px-6 h-full flex flex-col lg:flex-row items-center relative z-10 gap-12 lg:gap-0">
                {/* Left Content */}
                <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2 mb-8 justify-center lg:justify-start"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#BEF264]"></span>
                        </span>
                        <span className="text-neutral-900 dark:text-[#BEF264] text-xs font-bold uppercase tracking-widest">Ogbomoso Hub Live</span>
                    </motion.div>

                    <HeroHeadline />

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="mt-6 text-neutral-600 dark:text-neutral-400 max-w-lg text-lg sm:text-xl leading-relaxed mx-auto lg:mx-0 font-medium"
                    >
                        Ogbomoso’s only verified housing network. Anti-scam escrow protection for Under-G, Adenike, and General students.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
                    >
                        <button 
                            onClick={() => router.push('/rent')}
                            className="bg-black dark:bg-[#BEF264] text-white dark:text-black font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                        >
                            Explore Hostels
                        </button>
                        <button 
                            onClick={() => {
                                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-white dark:bg-white/10 text-black dark:text-white border border-neutral-200 dark:border-white/20 font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/20 transition-all backdrop-blur-sm"
                        >
                            How it works
                        </button>
                    </motion.div>
                </div>

                {/* Right Content - 3D Scene / Visual */}
                <div className="flex-1 w-full relative h-[350px] md:h-[500px] lg:h-[650px]">
                    <SplineScene
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                    />
                </div>
            </div>
        </section>
    );
}
