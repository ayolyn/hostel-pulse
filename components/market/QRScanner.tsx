'use client'

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface QRScannerProps {
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
}

export function QRScanner({ onSuccess, onClose }: QRScannerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    async function onScanSuccess(decodedText: string) {
      if (loading) return;
      setLoading(true);
      setError(null);
      
      try {
        // Validate transaction ID format (UUID)
        if (!decodedText.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            throw new Error("Invalid QR Code. Please scan the Seller's verification code.");
        }

        // Trigger Escrow Release RPC or Update
        const { error: updateError } = await supabase
            .from('escrow_transactions')
            .update({ status: 'Released' })
            .eq('id', decodedText)
            .eq('status', 'Locked');

        if (updateError) throw updateError;

        scanner.clear();
        onSuccess(decodedText);
      } catch (err: any) {
        console.error('Scan processing error:', err);
        setError(err.message || "Failed to verify transaction. Try again.");
        setLoading(false);
      }
    }

    function onScanFailure(error: any) {
      // Ignore constant scanning failures (normal for some libraries)
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onSuccess, supabase, loading]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-950 rounded-[40px] shadow-2xl max-w-sm w-full border border-gray-100 dark:border-white/5 relative z-10 overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black dark:hover:text-white z-20"
        >
          <X size={24} />
        </button>

        <div className="p-8 text-center bg-[#BEF264]/5 border-b border-[#BEF264]/10">
          <div className="w-12 h-12 bg-[#BEF264] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera size={24} className="text-black" />
          </div>
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter">Scan Verification QR</h2>
          <p className="text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mt-1">Scan the code from the Seller's phone</p>
        </div>

        <div className="p-6">
            <div id="qr-reader" className="overflow-hidden rounded-3xl border-2 border-dashed border-[#BEF264]/30" />
            
            {loading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm font-black text-[#BEF264]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    VERIFYING...
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-tight text-center">
                    {error}
                </div>
            )}

            <div className="mt-6 flex items-start gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                <ShieldCheck size={18} className="text-[#BEF264] shrink-0" />
                <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-relaxed font-bold uppercase tracking-tight text-left">
                    Your money will be released to the seller once scanned. Only scan if you have the item in hand and are satisfied.
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
