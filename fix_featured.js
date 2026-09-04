const fs = require('fs');
let file = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');

file = file.replace(/text-emerald-500/g, 'text-[#BEF264]');
file = file.replace(/text-emerald-400/g, 'text-[#d9f99d]');
file = file.replace(/hover:text-emerald-500/g, 'hover:text-[#BEF264]');
file = file.replace(/hover:border-emerald-500\/30/g, 'hover:border-[#BEF264]/40');
file = file.replace(/hover:bg-emerald-50/g, 'hover:bg-[#BEF264]/10');
file = file.replace(/hover:bg-emerald-600/g, 'hover:bg-[#a3e635]');
file = file.replace(/bg-emerald-500/g, 'bg-[#BEF264] text-black'); // Make buttons with this bg have black text

// Make the animation better
file = file.replace(
    `<h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">`,
    `<motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight"
            >`
);

file = file.replace(
    `Trending <span className="text-[#BEF264]">Hostels</span>
            </h2>`,
    `Trending <span className="text-[#BEF264]">Hostels</span>
            </motion.h2>`
);

file = file.replace(
    `<p className="text-sm md:text-base text-gray-600 dark:text-gray-400">`,
    `<motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium"
            >`
);

file = file.replace(
    `The most sought-after verified properties around campus this week.
            </p>`,
    `The most sought-after verified properties around campus this week.
            </motion.p>`
);

fs.writeFileSync('components/home/FeaturedListings.tsx', file, 'utf8');
console.log('Fixed FeaturedListings colors and animation');
