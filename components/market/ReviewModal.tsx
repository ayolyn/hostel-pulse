'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, X, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewModalProps {
    sellerId: string;
    itemId: string;
    buyerName: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ReviewModal({ sellerId, itemId, buyerName, onClose, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('reviews')
            .insert({
                target_id: sellerId,
                target_type: 'seller',
                item_id: itemId,
                rating,
                comment,
                reviewer_id: (await supabase.auth.getUser()).data.user?.id
            });

        setLoading(false);
        if (!error) {
            setSubmitted(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 2000);
        } else {
            console.error(error);
            toast.error('Failed to submit review.');
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 w-full max-w-sm mx-auto shadow-2xl relative overflow-hidden">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors z-10">
                <X className="w-5 h-5" />
            </button>

            <div className="p-10 text-center">
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Rate the Seller</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Help others by sharing your experience</p>
                        </div>

                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transform hover:scale-125 transition-transform"
                                >
                                    <Star 
                                        className={`w-10 h-10 ${rating >= star ? "fill-[#BEF264] text-[#BEF264]" : "text-gray-200 dark:text-neutral-800"}`} 
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            required
                            placeholder="How was the item? Was the seller on time?"
                            className="w-full h-32 p-5 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm text-center resize-none"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-[#BEF264]/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            Submit Review
                        </button>
                    </form>
                ) : (
                    <div className="py-12 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-[#BEF264]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Review Submitted!</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                            Thank you for helping keep the Ogbomoso Market safe and trusted.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
