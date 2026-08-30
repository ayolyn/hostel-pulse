"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Upload, Shield, Zap, TrendingUp, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function SellPage() {
    const features = [
        {
            icon: <Upload className="w-8 h-8 text-[#BEF264]" />,
            title: "Easy Listing",
            description: "Upload your property details and high-quality photos in minutes."
        },
        {
            icon: <Shield className="w-8 h-8 text-[#BEF264]" />,
            title: "Verified Buyers",
            description: "We vet all potential buyers to ensure serious inquiries only."
        },
        {
            icon: <Zap className="w-8 h-8 text-[#BEF264]" />,
            title: "Fast Results",
            description: "Our platform matches your property with the right students and investors."
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-[#BEF264]" />,
            title: "Best Value",
            description: "Get the best market price for your property through our competitive platform."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PublicHeader />
            <main className="pt-32">
                {/* Hero Section */}
                <section className="px-6 max-w-7xl mx-auto w-full mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tighter mb-6">
                            List Your Property <br />
                            <span className="text-gray-400">With HOSTELPULSE</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                            Join thousands of landlords and property owners reaching premium student tenants and verified buyers in Ogbomoso.
                        </p>
                        <Link
                            href="/dashboard/landlord?tab=listings"
                            className="bg-[#BEF264] text-black font-black uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-[#a6d456] transition-all shadow-xl hover:scale-105 inline-flex items-center gap-3"
                        >
                            Start Listing Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section className="bg-gray-50 py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100"
                                >
                                    <div className="mb-6 p-4 bg-[#BEF264]/10 rounded-2xl w-fit">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">{feature.title}</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sell CTA */}
                <section className="py-24 px-6 max-w-7xl mx-auto w-full">
                    <div className="bg-black rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8">
                                Ready to sell or <br /> lease out your space?
                            </h2>
                            <p className="text-gray-400 text-lg mb-10 font-medium">
                                HOSTELPULSE provides the tools and exposure you need to find the perfect match for your property. No hassle, no hidden fees.
                            </p>
                            <Link
                                href="/dashboard/landlord?tab=listings"
                                className="bg-white text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-gray-100 transition-all inline-flex items-center gap-3"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#BEF264]/20 to-transparent pointer-events-none" />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
