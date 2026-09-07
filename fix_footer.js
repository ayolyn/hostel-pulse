const fs = require('fs');
let file = fs.readFileSync('components/layout/Footer.tsx', 'utf8');

// Fix spacing on the footer container
file = file.replace(
    /className="bg-black text-gray-400 py-8 md:py-24 px-6 border-t border-white\/5"/,
    'className="bg-black text-gray-400 pt-16 pb-8 px-6 border-t border-white/5"'
);

// Fix spacing above the bottom bar
file = file.replace(
    /className="max-w-7xl mx-auto mt-12 md:mt-24 pt-8 border-t border-white\/5 flex flex-col md:flex-row justify-between items-center gap-6"/,
    'className="max-w-7xl mx-auto mt-12 md:mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6"'
);

// Fix empty links
file = file.replace(
    /<Link href="#" className="hover:text-white transition-all">Privacy<\/Link>/,
    '<Link href="/privacy" className="hover:text-white transition-all">Privacy</Link>'
);

file = file.replace(
    /<Link href="#" className="hover:text-white transition-all">Terms<\/Link>/,
    '<Link href="/terms" className="hover:text-white transition-all">Terms</Link>'
);

fs.writeFileSync('components/layout/Footer.tsx', file, 'utf8');
console.log('Fixed footer spacing and links');
