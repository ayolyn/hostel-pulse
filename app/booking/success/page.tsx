"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, ShieldCheck, ArrowRight, Home } from "lucide-react";

function SuccessContent() {
    const params = useSearchParams();
    const txRef = params.get("tx_ref") ?? "";
    const amount = Number(params.get("amount") ?? 0);
    const property = params.get("property") ?? "your property";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Success card */}
                <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/10 p-8 text-center shadow-xl">
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-[#BEF264] flex items-center justify-center shadow-lg shadow-[#BEF264]/30">
                            <CheckCircle className="w-10 h-10 text-black" strokeWidth={2.5} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                        Payment Confirmed!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Your payment of{" "}
                        <span className="font-black text-gray-900 dark:text-white">
                            ₦{amount.toLocaleString()}
                        </span>{" "}
                        for <strong>{property}</strong> is now securely locked in HostelPulse Escrow.
                    </p>

                    {/* Escrow badge */}
                    <div className="bg-[#BEF264]/10 border border-[#BEF264]/30 rounded-2xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-[#BEF264] shrink-0" />
                            <div className="text-left">
                                <p className="font-black text-gray-900 dark:text-white text-sm">
                                    Escrow Active
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    Funds are released only after you inspect and verify the property.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What happens next */}
                    <div className="text-left space-y-3 mb-8">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                            What happens next
                        </p>
                        {[
                            "The agent has been notified and will contact you",
                            "Schedule your physical inspection via the Inspections tab",
                            "After you verify the property, scan the agent's QR code",
                            "Funds are instantly released to the agent",
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="w-5 h-5 bg-[#BEF264] text-black text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{step}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tx ref */}
                    {txRef && (
                        <p className="text-[10px] text-gray-400 font-mono mb-6 bg-gray-50 dark:bg-white/5 rounded-lg p-2 break-all">
                            Transaction Ref: {txRef}
                        </p>
                    )}

                    {/* CTAs */}
                    <div className="space-y-3">
                        <Link
                            href="/dashboard/student?tab=inspections"
                            className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-[#a6d456] transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#BEF264]/20"
                        >
                            View Inspections <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/"
                            className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="w-8 h-8 rounded-full border-2 border-[#BEF264] border-t-transparent animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
