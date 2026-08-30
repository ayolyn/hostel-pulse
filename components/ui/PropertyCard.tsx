"use client";

import { motion } from "framer-motion";
import { Star, MapPin, Heart, CheckCircle } from "lucide-react";
import Image from "next/image";
import Badge from "./Badge";
import { useSaved } from "@/components/providers/SavedProvider";
import { useEffect, useRef } from "react";
import { trackPropertyEvent } from "@/lib/analytics";

interface PropertyProps {
    image: string;
    title: string;
    location: string;
    price: string;
    rating: number;
    verified?: boolean;
    priceLabel?: string;
    id?: string;
}

export default function PropertyCard({
    image,
    title,
    location,
    price,
    rating,
    verified = false,
    priceLabel = "Yearly Rent",
    id
}: PropertyProps) {
    const { isSaved, toggleSave } = useSaved();
    const saved = id ? isSaved(id) : false;

    const handleHeartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (id) toggleSave(id);
    };

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    trackPropertyEvent(id, 'impression');
                    observer.disconnect(); // Only track impression once per load
                }
            },
            { threshold: 0.5 } // 50% of the card must be visible
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, [id]);

    return (
        <motion.div
            ref={cardRef}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 min-w-[280px] w-full flex-shrink-0 cursor-pointer"
        >
            <div className="relative h-64 w-full">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {verified && <Badge className="bg-[#BEF264] text-black shadow-lg border-none flex items-center gap-1 font-black">
                        <CheckCircle className="w-3 h-3" /> Live View
                    </Badge>}
                </div>
                <button 
                    onClick={handleHeartClick}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all group/heart border border-white/10 shadow-lg active:scale-90
                        ${saved ? 'bg-[#BEF264] text-black border-none' : 'bg-black/40 text-white hover:bg-black/60'}
                    `}
                >
                    <Heart className={`w-5 h-5 transition-colors ${saved ? 'fill-current' : 'group-hover/heart:text-[#BEF264]'}`} />
                </button>

                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/10">
                    <Star className="w-3 h-3 text-[#BEF264] fill-[#BEF264]" />
                    <span className="text-xs font-black text-white">{rating}</span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-lg text-gray-900 group-hover:text-black transition-colors uppercase tracking-tight">{title}</h3>
                </div>

                <div className="flex items-center text-gray-500 mb-4 text-[10px] font-bold uppercase tracking-widest">
                    <MapPin className="w-3 h-3 mr-1 text-[#BEF264]" />
                    <span className="truncate">{location}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{priceLabel}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-gray-900">{price}</span>
                        </div>
                    </div>
                    <button className="bg-gray-900 p-3 rounded-2xl hover:bg-[#BEF264] text-white hover:text-black transition-all shadow-xl shadow-gray-900/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
