"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AnimatedHeroText() {
    const phrases = [
        "Find a verified hostel in Under-G.",
        "Get your gas cylinder refilled.",
        "Hire a runner for your laundry.",
        "Zero agent scams. 100% Escrow."
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-12 md:h-16 relative overflow-hidden flex items-center justify-center mt-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 40, opacity: 0, rotateX: -90 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    exit={{ y: -40, opacity: 0, rotateX: 90 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute text-xl sm:text-2xl md:text-3xl font-medium text-emerald-400"
                    style={{ transformPerspective: 1000 }}
                >
                    {phrases[index]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
