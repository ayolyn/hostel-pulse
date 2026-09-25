"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Delete, Loader2 } from "lucide-react";

interface PinKeypadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (pin: string) => Promise<void>;
    title?: string;
    loading?: boolean;
}

export function PinKeypadModal({ isOpen, onClose, onSubmit, title = "Enter Payout PIN", loading = false }: PinKeypadModalProps) {
    const [pin, setPin] = useState<string>("");
    const [shake, setShake] = useState(false);
    const [maskedDigits, setMaskedDigits] = useState<boolean[]>([false, false, false, false]);

    const handleKeyPress = useCallback((key: string) => {
        if (loading) return;
        
        if (key === "Backspace") {
            setPin(prev => prev.slice(0, -1));
            return;
        }

        if (pin.length < 4 && /^[0-9]$/.test(key)) {
            setPin(prev => prev + key);
        }
    }, [pin, loading]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Backspace") {
                handleKeyPress("Backspace");
            } else if (/^[0-9]$/.test(e.key)) {
                handleKeyPress(e.key);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleKeyPress]);

    useEffect(() => {
        if (pin.length === 4 && !loading) {
            const submitPin = async () => {
                try {
                    await onSubmit(pin);
                } catch (error) {
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                    setPin("");
                }
            };
            submitPin();
        }
    }, [pin, loading, onSubmit]);

    useEffect(() => {
        const maskTimeouts: NodeJS.Timeout[] = [];
        const newMaskedDigits = [false, false, false, false];
        
        for (let i = 0; i < 4; i++) {
            if (i < pin.length) {
                if (i === pin.length - 1) {
                    maskTimeouts.push(
                        setTimeout(() => {
                            setMaskedDigits(prev => {
                                const next = [...prev];
                                next[i] = true;
                                return next;
                            });
                        }, 300)
                    );
                } else {
                    newMaskedDigits[i] = true;
                }
            } else {
                newMaskedDigits[i] = false;
            }
        }
        setMaskedDigits(newMaskedDigits);
        return () => maskTimeouts.forEach(clearTimeout);
    }, [pin]);

    useEffect(() => {
        if (isOpen) {
            setPin("");
            setShake(false);
            setMaskedDigits([false, false, false, false]);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                {title}
                            </h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 flex flex-col items-center flex-1">
                            <motion.div 
                                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className="flex gap-4 mb-6"
                            >
                                {[0, 1, 2, 3].map((index) => {
                                    const isActive = pin.length === index;
                                    const hasValue = index < pin.length;
                                    const isMasked = maskedDigits[index];

                                    return (
                                        <div 
                                            key={index}
                                            className={`w-14 h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                                                isActive 
                                                    ? 'border-2 border-[#BEF264] bg-[#BEF264]/10 text-gray-900 dark:text-white' 
                                                    : hasValue 
                                                        ? 'border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white'
                                                        : 'border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-transparent'
                                            }`}
                                        >
                                            {hasValue ? (isMasked ? '•' : pin[index]) : ''}
                                        </div>
                                    );
                                })}
                            </motion.div>

                            <button className="text-sm font-bold text-[#BEF264] hover:text-[#a6d456] transition-colors mb-8">
                                Forgot PIN?
                            </button>

                            <div className="grid grid-cols-3 gap-y-6 gap-x-12 w-full max-w-[280px] mx-auto mt-auto">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleKeyPress(num.toString())}
                                        className="w-16 h-16 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20 text-2xl font-black text-gray-900 dark:text-white transition-colors"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <div className="w-16 h-16"></div>
                                <button
                                    onClick={() => handleKeyPress("0")}
                                    className="w-16 h-16 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20 text-2xl font-black text-gray-900 dark:text-white transition-colors"
                                >
                                    0
                                </button>
                                <button
                                    onClick={() => handleKeyPress("Backspace")}
                                    className="w-16 h-16 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20 text-gray-500 dark:text-gray-400 transition-colors"
                                >
                                    <Delete className="w-8 h-8" />
                                </button>
                            </div>
                            
                            {loading && (
                                <div className="mt-6 flex items-center gap-2 text-[#BEF264]">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="font-bold">Processing...</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
