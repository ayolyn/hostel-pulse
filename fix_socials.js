const fs = require('fs');
let file = fs.readFileSync('components/layout/Footer.tsx', 'utf8');

file = file.replace(
    /<Link href="#" className="w-10 h-10/g,
    '<Link href="https://twitter.com/hostelpulse" target="_blank" className="w-10 h-10'
);

// wait the second one is instagram
file = file.replace(
    /href="https:\/\/twitter.com\/hostelpulse" target="_blank" className="w-10 h-10 bg-white\/5 rounded-xl flex items-center justify-center hover:bg-\[\#BEF264\]\/10 hover:text-\[\#BEF264\] transition-all border border-white\/5">\s*<Instagram/g,
    'href="https://instagram.com/hostelpulse" target="_blank" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#BEF264]/10 hover:text-[#BEF264] transition-all border border-white/5">\n                            <Instagram'
);

fs.writeFileSync('components/layout/Footer.tsx', file, 'utf8');
console.log('Fixed social links too');
