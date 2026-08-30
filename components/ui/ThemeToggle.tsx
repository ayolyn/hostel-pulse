'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5" />;
    }

    const themes = [
        { name: 'light', icon: Sun },
        { name: 'dark', icon: Moon },
        { name: 'system', icon: Monitor },
    ];

    const ThemeIcon = themes.find((t) => t.name === theme)?.icon || Monitor;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition-all border border-neutral-200 dark:border-white/10 group"
                aria-label="Toggle theme"
            >
                <ThemeIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-[#BEF264] transition-colors" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-36 py-1.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
                        >
                            {themes.map(({ name, icon: Icon }) => (
                                <button
                                    key={name}
                                    onClick={() => {
                                        setTheme(name);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${theme === name
                                            ? 'text-[#BEF264] bg-black dark:bg-[#BEF264]/10'
                                            : 'text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {name}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
