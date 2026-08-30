'use client';

import { motion } from 'framer-motion';

export function HeroHeadline() {
    return (
        <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black text-black dark:text-white leading-[0.9] tracking-tighter mb-8"
        >
            BOOK YOUR <br />
            <motion.span
                initial={{ backgroundColor: "rgba(190, 242, 100, 0)" }}
                animate={{ backgroundColor: "rgba(190, 242, 100, 1)" }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-black px-4 inline-block mt-2"
            >
                SAFE HOME.
            </motion.span>
        </motion.h1>
    );
}
