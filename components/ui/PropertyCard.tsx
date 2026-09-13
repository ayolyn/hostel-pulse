"use client";

import { motion } from "framer-motion";
import { Star, MapPin, Heart, CheckCircle, Video, Shield, Info, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Badge from "./Badge";
import { useSaved } from "@/components/providers/SavedProvider";
import { useEffect, useRef } from "react";
import { trackPropertyEvent } from "@/lib/analytics";

interface PropertyProps {
    id?: string;
    image: string;
    title: string;
    location: string;
    category?: string;
    price: string;
    totalMoveInCost?: string;
    verificationStatus?: string;
    hasWalkthrough?: boolean;
    isAvailable?: boolean;
    rating?: number;
}

export default function PropertyCard({
    id,
    image,
    title,
    location,
    category,
    price,
    totalMoveInCost,
    verificationStatus,
    hasWalkthrough = false,
    isAvailable = true,
    rating = 0
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
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, [id]);

    const getVerificationIcon = () => {
        if (verificationStatus === 'Physically Inspected') return <CheckCircle className="w-3 h-3 text-emerald-500" />;
        if (verificationStatus === 'Details Checked') return <CheckCircle className="w-3 h-3 text-blue-500" />;
        if (verificationStatus === 'Pending Review' || verificationStatus === 'Pending') return <Info className="w-3 h-3 text-amber-500" />;
        if (verificationStatus === 'Requires Update') return <AlertTriangle className="w-3 h-3 text-orange-500" />;
        return <Shield className="w-3 h-3 text-gray-400" />;
    };

    return (
        <motion.div
            ref={cardRef}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 min-w-[280px] w-full flex-shrink-0 cursor-pointer flex flex-col h-full"
        >
            <div className="relative h-56 w-full shrink-0 bg-gray-100">
                <Image
                    src={image || '/placeholder.jpg'}
                    alt={title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />
                
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {!isAvailable && (
                        <Badge className="bg-red-500 text-white shadow-sm border-none font-black text-[10px] uppercase tracking-widest px-2 py-0.5">
                            Unavailable
                        </Badge>
                    )}
                </div>

                <button 
                    onClick={handleHeartClick}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all group/heart border shadow-sm active:scale-90
                        ${saved ? 'bg-[#BEF264] text-black border-transparent' : 'bg-black/20 text-white border-white/20 hover:bg-black/40'}
                    `}
                >
                    <Heart className={`w-4 h-4 transition-colors ${saved ? 'fill-current' : 'group-hover/heart:text-[#BEF264]'}`} />
                </button>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{location}</span>
                    <span className="mx-1">•</span>
                    <span className="truncate">{category || 'Property'}</span>
                </div>

                <h3 className="font-black text-base text-gray-900 group-hover:text-black transition-colors uppercase tracking-tight line-clamp-1 mb-2">{title}</h3>

                <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                        {getVerificationIcon()}
                        <span className="uppercase tracking-wide truncate">{verificationStatus || 'Unverified'}</span>
                    </div>
                    {hasWalkthrough && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                            <Video className="w-3 h-3 text-[#BEF264]" />
                            <span className="uppercase tracking-wide">Raw Walkthrough</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Rent</span>
                        <div className="text-sm font-bold text-gray-500 line-through decoration-gray-300">{price}/yr</div>
                    </div>
                    
                    {totalMoveInCost ? (
                        <div className="flex flex-col items-end text-right">
                            <span className="text-[9px] font-black uppercase text-[#BEF264] tracking-widest bg-black px-1.5 py-0.5 rounded">Total Move-In</span>
                            <div className="text-lg font-black text-gray-900">{totalMoveInCost}</div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end text-right">
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest bg-gray-100 px-1.5 py-0.5 rounded">Rent Only</span>
                            <div className="text-lg font-black text-gray-900">{price}</div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}