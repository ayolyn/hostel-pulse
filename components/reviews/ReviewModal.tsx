"use client";

import React, { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { submitProviderReview } from "@/app/actions/reviews";
import { toast } from "react-hot-toast";

interface ReviewModalProps {
    providerId: string;
    providerName: string;
    onClose: () => void;
}

export function ReviewModal({ providerId, providerName, onClose }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }

        setLoading(true);
        const res = await submitProviderReview({
            providerId,
            rating,
            comment
        });
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Review submitted successfully!");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] w-full max-w-md p-5 relative shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white pr-10 leading-none">
                    Rate Your Experience
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
                    With {providerName}
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star 
                                    className={`w-10 h-10 ${
                                        (hoverRating || rating) >= star 
                                            ? "fill-yellow-400 text-yellow-400 drop-shadow-md" 
                                            : "fill-transparent text-gray-300 dark:text-neutral-700"
                                    } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">
                            Write a review (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How was your experience?"
                            className="w-full h-32 p-4 rounded-3xl bg-gray-50 dark:bg-neutral-800 border-2 border-transparent focus:border-[#BEF264] outline-none font-medium text-gray-900 dark:text-white transition-all resize-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || rating === 0}
                        className="w-full flex items-center justify-center gap-2 bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black font-black py-3 rounded-[1.8rem] uppercase tracking-widest text-sm shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
    );
}
