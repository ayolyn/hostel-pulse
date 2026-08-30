'use client';

import { motion } from 'framer-motion';

interface SpotlightProps {
    className?: string;
    fill?: string;
}

export function Spotlight({ className = '', fill = '#BEF264' }: SpotlightProps) {
    return (
        <motion.svg
            className={`absolute pointer-events-none ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 3000 3000"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 1.5 }}
        >
            <defs>
                <radialGradient id="spotlight-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={fill} stopOpacity="0.8" />
                    <stop offset="50%" stopColor={fill} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={fill} stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="1500" cy="1500" r="1500" fill="url(#spotlight-gradient)" />
        </motion.svg>
    );
}
