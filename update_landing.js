const fs = require('fs');
let file = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

// Replace standard tailwind emerald with exact logo color
file = file.replace(/text-emerald-500/g, 'text-[#BEF264]');
file = file.replace(/bg-emerald-500\/10/g, 'bg-[#BEF264]/10');
file = file.replace(/bg-emerald-500\/30/g, 'bg-[#BEF264]/30');
file = file.replace(/bg-emerald-500\/20/g, 'bg-[#BEF264]/20');
file = file.replace(/bg-emerald-500/g, 'bg-[#BEF264]');
file = file.replace(/shadow-emerald-500\/20/g, 'shadow-[#BEF264]/20');
file = file.replace(/border-emerald-500\/20/g, 'border-[#BEF264]/20');
file = file.replace(/hover:bg-emerald-400/g, 'hover:bg-[#d9f99d]');

// Add better Hero Text animations
file = file.replace(
    `<motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center z-10 max-w-3xl mx-auto w-full flex flex-col items-center"
                    >`,
    `<motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, staggerChildren: 0.2 }}
                        className="text-center z-10 max-w-4xl mx-auto w-full flex flex-col items-center"
                    >`
);

file = file.replace(
    `<h1 className="text-[2.75rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-gray-900 dark:text-white uppercase">
                            Your Campus <br />
                            <span className="text-[#BEF264] relative inline-block">
                                Ecosystem.
                                {/* Underline decoration */}
                                <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#BEF264]/30 rounded-full" />
                            </span>
                        </h1>`,
    `<motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-[3rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-gray-900 dark:text-white uppercase"
                        >
                            Your Campus <br />
                            <span className="text-[#BEF264] relative inline-block mt-2">
                                Ecosystem.
                                {/* Underline decoration */}
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                                    className="absolute -bottom-3 left-0 right-0 h-3 bg-[#BEF264]/30 rounded-full" 
                                />
                            </span>
                        </motion.h1>`
);

// Add animation to virtual hub
file = file.replace(
    `<div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#BEF264]/20 to-transparent rounded-3xl border border-[#BEF264]/20 flex flex-col items-center justify-center shadow-2xl overflow-hidden mb-12">`,
    `<motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="relative mx-auto w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#BEF264]/20 to-transparent rounded-3xl border border-[#BEF264]/20 flex flex-col items-center justify-center shadow-2xl overflow-hidden mb-12"
                            >`
);

file = file.replace(`</CheckCircle>\n                                    <span`, `</CheckCircle>\n                                    </span>\n                                    <span`);
file = file.replace(/<\/div>\n\n                            \{\/\* Sleek Search Bar \*\/\}/g, `</motion.div>\n\n                            {/* Sleek Search Bar */}`);

fs.writeFileSync('app/LandingPageClient.tsx', file, 'utf8');
console.log('Updated LandingPageClient with perfect colors and animations');
