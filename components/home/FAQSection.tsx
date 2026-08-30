'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: 'How do I know the house is real?',
        answer: 'Every listing is verified by our admin team with a 30-second video walkthrough. You see exactly what you\'re getting before making any payment.',
    },
    {
        question: 'What if the agent doesn\'t show up?',
        answer: 'We hold a ₦2,000 inspection escrow. If the agent doesn\'t show up for your scheduled inspection, you get an automatic refund.',
    },
    {
        question: 'Can I pay in installments?',
        answer: 'Yes! Use our wallet system to pay your rent in flexible installments. No more lump sum stress.',
    },
    {
        question: 'Is my money safe?',
        answer: 'Absolutely. We use an escrow system where funds are held securely until you confirm you\'ve received your keys and are satisfied with the property.',
    },
    {
        question: 'What areas do you cover?',
        answer: 'We cover all major student areas in Ogbomoso: Under-G, Adenike, General, and surrounding neighborhoods near LAUTECH campus.',
    },
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 px-6 bg-white dark:bg-black transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white mb-4">
                        Common <span className="text-[#BEF264]">Questions</span>
                    </h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400">
                        Everything you need to know about HOSTELPULSE
                    </p>
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`bg-neutral-50 dark:bg-neutral-900/50 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-[#BEF264]' : 'border-neutral-200 dark:border-neutral-800'
                                }`}
                        >
                            {/* Question Button */}
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/30 transition-colors"
                            >
                                <span className="text-lg font-bold text-neutral-900 dark:text-white pr-4">{faq.question}</span>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-shrink-0"
                                >
                                    {openIndex === index ? (
                                        <Minus className="w-5 h-5 text-[#BEF264]" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-neutral-400" />
                                    )}
                                </motion.div>
                            </button>

                            {/* Answer */}
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-5 text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
