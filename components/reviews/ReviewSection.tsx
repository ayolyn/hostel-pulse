"use client";

import React, { useState } from "react";
import { Star, ShieldCheck, MessageSquare } from "lucide-react";
import { ReviewModal } from "./ReviewModal";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    is_verified_interaction: boolean;
    created_at: string;
    reviewer?: {
        full_name?: string;
        avatar_url?: string;
    };
}

interface ReviewSectionProps {
    providerId: string;
    providerName: string;
    reviews: Review[];
    canReview: boolean;
}

export function ReviewSection({ providerId, providerName, reviews, canReview }: ReviewSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <section className="mt-12 pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    Client Reviews ({reviews.length})
                </h3>
                {canReview && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-black text-[#BEF264] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        Leave a Review
                    </button>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 text-center shadow-sm">
                    <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">No reviews yet</h4>
                    <p className="text-gray-500 mt-2">This provider doesn't have any reviews yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center font-bold text-gray-500">
                                        {review.reviewer?.avatar_url ? (
                                            <img src={review.reviewer.avatar_url} alt="Reviewer" className="w-full h-full object-cover" />
                                        ) : (
                                            review.reviewer?.full_name?.charAt(0) || "U"
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-sm">
                                            {review.reviewer?.full_name || "Anonymous User"}
                                        </p>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                            {review.is_verified_interaction && (
                                                <>
                                                    <span className="mx-1">•</span>
                                                    <span className="text-emerald-500 flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3" /> Verified Client
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                            key={star} 
                                            className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-200"}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-gray-600 font-medium text-sm leading-relaxed pl-14">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <ReviewModal 
                    providerId={providerId} 
                    providerName={providerName} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </section>
    );
}
