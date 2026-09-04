const fs = require('fs');
let file = fs.readFileSync('components/home/WhyHostelPulse.tsx', 'utf8');

file = file.replace(/text-emerald-500/g, 'text-[#BEF264]');
file = file.replace(/text-emerald-400/g, 'text-[#d9f99d]');
file = file.replace(/text-emerald-600/g, 'text-[#BEF264]');
file = file.replace(/bg-emerald-500\/10/g, 'bg-[#BEF264]/10');
file = file.replace(/bg-emerald-500/g, 'bg-[#BEF264] text-black');
file = file.replace(/bg-emerald-100/g, 'bg-[#BEF264]/20');

// Add animations
file = file.replace(
    `<h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">`,
    `<motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tighter"
          >`
);

file = file.replace(
    `Stop paying agents for <br className="hidden md:block"/>hostels you haven't seen.
          </h2>`,
    `Stop paying agents for <br className="hidden md:block"/>hostels you haven't seen.
          </motion.h2>`
);

file = file.replace(
    `<p className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">`,
    `<motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed"
          >`
);

file = file.replace(
    `Instantly. No stories.
          </p>`,
    `Instantly. No stories.
          </motion.p>`
);

// Animate the grid cards
file = file.replace(
    `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`,
    `<motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >`
);

file = file.replace(
    `<div className="lg:col-span-2 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between">`,
    `<motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="lg:col-span-2 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between group hover:border-[#BEF264]/40 transition-colors"
          >`
);

file = file.replace(
    `<div className="flex flex-col gap-6">`,
    `</motion.div>\n          <div className="flex flex-col gap-6">`
);

// To avoid messing up div matching, let's just do it directly on the small cards
file = file.replace(
    `<div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 flex-1 relative overflow-hidden">`,
    `<motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 flex-1 relative overflow-hidden group hover:border-[#BEF264]/40 transition-colors"
            >`
);

file = file.replace(
    `</p>
            </div>`,
    `</p>
            </motion.div>`
);

// Because there are two of these small cards, replace all occurrences.
file = file.replace(
    /<\/p>\s*<\/div>/g, 
    '</p>\n            </motion.div>'
);
// Wait, the regex replace above might break if it replaces all `</p></div>`. 
// I will let it be, and manually check it. Actually let's just write the whole file content to be safe and perfect!
