'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How do I know the house is real?",
    answer: "Every listing on HostelPulse goes through a verification process. Agents must upload an unedited video walkthrough, and our team verifies the physical location before a listing goes live."
  },
  {
    question: "Do I have to pay to use HostelPulse?",
    answer: "Browsing listings, watching videos, and contacting agents or landlords on HostelPulse is completely free for students."
  },
  {
    question: "What areas in Ogbomoso do you cover?",
    answer: "We currently cover major student hotspots around LAUTECH, including Under-G, Adenike, General, Stadium Gate, and Aroje."
  },
  {
    question: "Are there other services besides hostels?",
    answer: "Yes! While housing is our main focus, you can also use HostelPulse to find roommates, hire students for gigs (like laundry or design), and buy or sell items on campus."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
            Common <span className="text-green-400">Questions</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Everything you need to know about renting safely on Hostel Pulse.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index}
                className={"border rounded-2xl transition-colors duration-300 ${isOpen ? 'bg-white/10 border-green-500/30' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-white/20'}"}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="text-lg font-semibold pr-4">{faq.question}</span>
                  
                  {/* Animated Plus/Minus Icon */}
                  <div className={"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-green-400/20 text-green-400' : 'bg-white/10 text-gray-600 dark:text-gray-400'}"}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {/* Framer Motion Smooth Dropdown */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-white/5 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
