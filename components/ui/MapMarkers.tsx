import { motion } from 'framer-motion';

export const MapMarker = ({ price, isSelected }: { price: string, isSelected?: boolean }) => (
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: isSelected ? 1.2 : 1, zIndex: isSelected ? 50 : 1 }}
        whileHover={{ scale: 1.2, zIndex: 50 }}
        className={`cursor-pointer px-3 py-1.5 rounded-full font-bold shadow-lg border-2 transition-colors
      ${isSelected
                ? 'bg-[#BEF264] text-[#111827] border-[#BEF264]' // Accent Lime for selected
                : 'bg-[#0D9488] text-white border-white'       // Primary Teal for default
            }`}
    >
        <span className="text-xs mr-0.5">€</span>{price}
    </motion.div>
);

export const ClusterMarker = ({ count }: { count: number }) => (
    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-xl border-2 border-[#0D9488] cursor-pointer hover:scale-105 transition-transform">
        <div className="absolute inset-1 rounded-full bg-[#0D9488]/10" />
        <span className="text-[#0D9488] font-bold text-sm z-10">{count}</span>
    </div>
);
