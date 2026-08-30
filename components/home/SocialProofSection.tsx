'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        quote: "I paid my rent through HOSTELPULSE and didn't have to worry about the agent disappearing.",
        author: 'Bolu',
        details: '300L Engineering',
    },
    {
        quote: 'The escrow system gave me peace of mind. Highly recommend!',
        author: 'Amaka',
        details: '200L Medicine',
    },
    {
        quote: 'Found my hostel in Under-G within 2 days. Amazing!',
        author: 'Tunde',
        details: '400L Computer Science',
    },
    {
        quote: 'No more scam landlords. HOSTELPULSE verified everything before I paid.',
        author: 'Chioma',
        details: '100L Law',
    },
    {
        quote: 'The 30-second video proof is genius. I saw my room before visiting!',
        author: 'Ibrahim',
        details: '300L Mechanical Engineering',
    },
];

export function SocialProofSection() {
    return (
        <section className="py-24 px-6 bg-white dark:bg-black transition-colors duration-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#BEF264]/10 dark:bg-[#BEF264]/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* 94% Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center mb-16"
                >
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-[#BEF264] to-emerald-500 flex items-center justify-center mb-6 shadow-2xl shadow-[#BEF264]/20"
                    >
                        <div className="text-center">
                            <div className="text-6xl font-black text-black">94%</div>
                            <div className="text-sm font-bold text-black/80">Recommend</div>
                        </div>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white text-center">
                        Trusted by <span className="text-[#BEF264]">LAUTECH</span> Students
                    </h2>
                </motion.div>

                {/* Testimonials Marquee */}
                <div className="relative">
                    <div className="overflow-hidden">
                        <motion.div
                            animate={{ x: ['0%', '-50%'] }}
                            transition={{
                                duration: 30,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="flex gap-6"
                            style={{ width: 'max-content' }}
                        >
                            {/* Duplicate testimonials for infinite scroll */}
                            {[...testimonials, ...testimonials].map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{
                                        rotateY: 5,
                                        rotateX: 5,
                                        scale: 1.05,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="w-80 bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 shadow-xl flex-shrink-0 border border-neutral-200 dark:border-white/5"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-[#BEF264] text-[#BEF264]" />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <p className="text-neutral-800 dark:text-neutral-300 font-medium mb-6 leading-relaxed">
                                        "{testimonial.quote}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BEF264] to-emerald-400 flex items-center justify-center font-bold text-black text-lg shadow-lg">
                                            {testimonial.author[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-900 dark:text-white">{testimonial.author}</div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">{testimonial.details}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
