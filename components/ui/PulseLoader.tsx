"use client";

import Image from 'next/image';

/**
 * PulseLoader — Full-screen heartbeat loading animation.
 * Uses the lime-green HostelPulse icon, pulsing at the rhythm
 * of the heartbeat line in the logo.
 */
export function PulseLoader({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0F172A]">
            {/* Outer glow ring */}
            <div className="relative flex items-center justify-center">
                <div
                    className="absolute w-40 h-40 rounded-full bg-[#BEF264]/10"
                    style={{ animation: 'pulse-ring 1.2s ease-in-out infinite' }}
                />
                <div
                    className="absolute w-28 h-28 rounded-full bg-[#BEF264]/15"
                    style={{ animation: 'pulse-ring 1.2s ease-in-out infinite 0.15s' }}
                />
                {/* Icon */}
                <div
                    className="relative w-20 h-20"
                    style={{ animation: 'heartbeat 1.2s ease-in-out infinite' }}
                >
                    <Image
                        src="/logo-icon.png"
                        alt="HostelPulse"
                        fill
                        className="object-contain drop-shadow-[0_0_16px_rgba(190,242,100,0.6)]"
                        priority
                    />
                </div>
            </div>

            {/* EKG line below icon */}
            <div className="mt-8 flex items-center gap-1 opacity-60">
                <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
                    <polyline
                        points="0,12 20,12 30,2 38,22 46,2 54,22 62,12 120,12"
                        stroke="#BEF264"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ animation: 'ekg-draw 1.2s ease-in-out infinite' }}
                    />
                </svg>
            </div>

            {message && (
                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">
                    {message}
                </p>
            )}

            <style jsx global>{`
                @keyframes heartbeat {
                    0%   { transform: scale(1); }
                    14%  { transform: scale(1.12); }
                    28%  { transform: scale(1); }
                    42%  { transform: scale(1.08); }
                    70%  { transform: scale(1); }
                    100% { transform: scale(1); }
                }
                @keyframes pulse-ring {
                    0%   { transform: scale(0.8); opacity: 0.8; }
                    50%  { transform: scale(1.1); opacity: 0.3; }
                    100% { transform: scale(0.8); opacity: 0.8; }
                }
                @keyframes ekg-draw {
                    0%   { stroke-dasharray: 0 200; stroke-dashoffset: 0; }
                    60%  { stroke-dasharray: 200 200; stroke-dashoffset: 0; }
                    100% { stroke-dasharray: 200 200; stroke-dashoffset: -200; }
                }
            `}</style>
        </div>
    );
}
