const fs = require('fs');
let file = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

file = file.replace(
    /<div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-emerald-500\/20 to-transparent rounded-3xl border border-\[\#BEF264\]\/20 flex flex-col items-center justify-center shadow-2xl overflow-hidden mb-12">/,
    `<motion.div 
                                animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative mx-auto w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#BEF264]/20 to-transparent rounded-3xl border border-[#BEF264]/20 flex flex-col items-center justify-center shadow-2xl overflow-hidden mb-12"
                            >`
);

fs.writeFileSync('app/LandingPageClient.tsx', file, 'utf8');
console.log('Fixed virtual hub animation and emerald');
