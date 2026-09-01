'use client'

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, ShieldCheck, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface QRGeneratorProps {
  transactionId: string;
  itemTitle: string;
  onClose: () => void;
}

export function QRGenerator({ transactionId, itemTitle, onClose }: QRGeneratorProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-950 p-6 rounded-[40px] shadow-2xl max-w-sm w-full border border-gray-100 dark:border-white/5 relative z-10 text-center"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black dark:hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="w-16 h-16 bg-[#BEF264]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Smartphone size={32} className="text-[#BEF264]" />
        </div>

        <h2 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-tighter">Verification QR</h2>
        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">
          Show this to the buyer for {itemTitle}
        </p>

        <div className="bg-white p-6 rounded-3xl shadow-inner border border-gray-50 mb-8 inline-block">
          <QRCodeSVG 
            value={transactionId} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="bg-[#BEF264]/5 border border-[#BEF264]/20 p-4 rounded-2xl flex gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-[#BEF264] shrink-0" />
          <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed font-bold uppercase tracking-tight">
            Only scan when you have received payment and the buyer is satisfied. This action is final.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
