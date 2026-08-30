'use client';

import { motion } from 'framer-motion';
import { Shield, Video, Zap } from 'lucide-react';

const features = [
    {
        icon: Shield,
        title: 'Scam Protection',
        description: 'We hold your money securely. You get the key only after verification.',
        color: 'from-emerald-500/20 to-teal-500/20',
    },
    {
        icon: Video,
        title: '30-Second Video Proof',
        description: 'Every agent must prove the house is real with a verification video.',
        color: 'from-teal-500/20 to-cyan-500/20',
    },
    {
        icon: Zap,
        title: 'Find in Minutes',
        description: 'No more weeks of searching. Find your perfect hostel in minutes.',
        color: 'from-cyan-500/20 to-emerald-500/20',
    },
];

export function AboutSection() {
    return (
        <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-black transition-colors duration-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#BEF264]/10 dark:bg-[#BEF264]/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white mb-4">
                        Why <span className="text-[#BEF264]">HOSTELPULSE</span>?
                    </h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Fixing Ogbomoso's P2P market with trust, speed, and transparency
                    </p>
                </motion.div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="group relative"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            {/* Card */}
                            <div className="relative bg-neutral-50 dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 group-hover:border-[#BEF264]/30 rounded-2xl p-8 transition-all duration-300">
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-8 h-8 text-[#BEF264]" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
