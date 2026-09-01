'use client'

import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface ReviewRoomProps {
  item: {
    id: string;
    title: string;
  };
  sellerId: string;
  sellerName: string;
  buyerId: string;
  onComplete: (data: { rating: number; comment: string }) => void;
  onClose?: () => void;
}

export function ReviewRoom({ item, sellerId, sellerName, buyerId, onComplete, onClose }: ReviewRoomProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);

    try {
        const { error } = await supabase
            .from('reviews')
            .insert({
                item_id: item.id,
                buyer_id: buyerId,
                seller_id: sellerId,
                rating: rating,
                comment: comment
            });

        if (error) throw error;
        
        onComplete({ rating, comment });
    } catch (err) {
        console.error('Review submission error:', err);
        toast.error('Failed to submit review. Your trust level will still be updated locally.');
        onComplete({ rating, comment });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 p-5 rounded-[40px] shadow-2xl max-w-md w-full border border-gray-100 dark:border-white/5 relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#BEF264] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#BEF264]/20">
            <CheckCircle size={40} className="text-black" />
          </div>
          
          <h2 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-tighter">Item Secured!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            How was your experience buying the <span className="font-bold text-black dark:text-white">{item.title}</span> from {sellerName}?
          </p>

          {/* Star Rating Logic */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => setRating(star)}
                className="hover:scale-110 transition-transform active:scale-95"
              >
                <Star 
                  size={36} 
                  className={star <= rating ? "fill-[#BEF264] text-[#BEF264]" : "text-gray-200 dark:text-neutral-800"} 
                  strokeWidth={rating >= star ? 0 : 2}
                />
              </button>
            ))}
          </div>

          <textarea 
            placeholder="Optional: Tell other students about the item condition..."
            className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#BEF264] h-32 mb-6 dark:text-white resize-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button 
            disabled={rating === 0 || isSubmitting}
            onClick={handleSubmit}
            className="w-full bg-black dark:bg-[#BEF264] dark:text-black text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all shadow-xl shadow-[#BEF264]/10"
          >
            {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>SUBMIT REVIEW <MessageSquare size={18} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
