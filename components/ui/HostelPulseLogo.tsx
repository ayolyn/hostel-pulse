'use client';

import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'dark' | 'light' | 'icon' | 'auto';
    size?: number | string;
}

export const HostelPulseLogo: React.FC<LogoProps> = ({ 
    className = "", 
    variant = 'auto', 
    size = 'auto' 
}) => {
    // If variant is 'auto', it will respect the theme (dark/light mode)
    // If 'dark' is forced, it uses White/Lime
    // If 'light' is forced, it uses Dark/Green
    
    const isIcon = variant === 'icon';

    return (
        <div className={`flex items-center gap-0 ${className}`} style={{ height: size }}>
            <svg 
                width="28" 
                height="28" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto"
            >
                <path 
                    d="M20 45L50 20L80 45V85H65V65H35V85H20V45Z" 
                    stroke="currentColor" 
                    className={
                        variant === 'dark' || variant === 'icon' ? "text-[#BEF264]" : 
                        variant === 'light' ? "text-neutral-900" : 
                        "text-[#BEF264] dark:text-[#BEF264] light:text-neutral-900" 
                    }
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <path 
                    d="M10 55L40 30L70 55" 
                    stroke="currentColor" 
                    className={
                        variant === 'dark' || variant === 'icon' ? "text-[#BEF264]" : 
                        variant === 'light' ? "text-neutral-900" : 
                        "text-[#BEF264] dark:text-[#BEF264] light:text-neutral-900" 
                    }
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    opacity="0.6"
                />
                <path 
                    d="M30 60H40L45 50L55 70L60 60H70" 
                    stroke="currentColor" 
                    className={
                        variant === 'dark' || variant === 'icon' ? "text-[#BEF264]" : 
                        variant === 'light' ? "text-neutral-900" : 
                        "text-[#BEF264] dark:text-[#BEF264] light:text-neutral-900" 
                    }
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </svg>
            
            {!isIcon && (
                <div className="flex font-black uppercase tracking-tighter text-xl">
                    <span className={
                        variant === 'dark' ? "text-white" : 
                        variant === 'light' ? "text-neutral-900" : 
                        "text-neutral-900 dark:text-white"
                    }>
                        Hostel
                    </span>
                    <span className={
                        variant === 'dark' ? "text-[#BEF264]" : 
                        variant === 'light' ? "text-green-700" : 
                        "text-green-700 dark:text-[#BEF264]"
                    } style={{ marginLeft: '0' }}>
                        Pulse
                    </span>
                </div>
            )}
        </div>
    );
};
