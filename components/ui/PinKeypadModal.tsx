"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Delete, Loader2 } from "lucide-react";

interface PinKeypadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (pin: string) => Promise<void>;
    onForgotPin?: () => void;
    title?: string;
    subtitle?: string;
    loading?: boolean;
}

export function PinKeypadModal({ isOpen, onClose, onSubmit, onForgotPin, title = "Enter Payout PIN", subtitle, loading = false }: PinKeypadModalProps) {
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
                <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
                        className="bg-white dark:bg-[#0F172A] w-full max-w-sm sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-white/5">
                            <div className="min-w-0 pr-2">
                                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                    {title}
                                </h3>
                                {subtitle && (
                                    <p className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 flex flex-col items-center flex-1 overflow-y-auto">
                            <motion.div 
                                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className="flex gap-2.5 sm:gap-4 mb-3 sm:mb-4"
                            >
                                {[0, 1, 2, 3].map((index) => {
                                    const isActive = pin.length === index;
                                    const hasValue = index < pin.length;
                                    const isMasked = maskedDigits[index];

                                    return (
                                        <div 
                                            key={index}
                                            className={`w-11 h-13 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all ${
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

                            <button 
                                type="button"
                                onClick={() => {
                                    if (onForgotPin) {
                                        onForgotPin();
                                    } else {
                                        const basePath = typeof window !== 'undefined' && window.location.pathname.includes('/dashboard') ? window.location.pathname : '/dashboard/student';
                                        window.location.href = `${basePath}?tab=settings&sub=security&action=forgot-pin`;
                                    }
                                }}
                                className="text-xs sm:text-sm font-bold text-[#BEF264] hover:text-[#a6d456] transition-colors mb-3 sm:mb-4"
                            >
                                Forgot PIN?
                            </button>

                            <div className="grid grid-cols-3 gap-y-2 sm:gap-y-3.5 gap-x-6 sm:gap-x-10 w-full max-w-[240px] sm:max-w-[270px] mx-auto">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleKeyPress(num.toString())}
                                        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20 text-xl sm:text-2xl font-black text-gray-900 dark:text-white transition-colors"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <div className="w-12 h-12 sm:w-14 sm:h-14"></div>
                                <button
                                    onClick={() => handleKeyPress("0")}
                                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20 text-xl sm:text-2xl font-black text-gray-900 dark:text-white transition-colors"
                                >
                                    0
                                </button>
                                <button
                                    onClick={() => handleKeyPress("Backspace")}
                                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20 text-gray-500 dark:text-gray-400 transition-colors"
                                >
                                    <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                            
                            {loading && (
                                <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[#BEF264]">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs sm:text-sm font-bold">Processing...</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
