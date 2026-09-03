const fs = require('fs');

// 1. Fix app/page.tsx
let page = fs.readFileSync('app/page.tsx', 'utf8');
page = page.replace(/\?1,500/g, '\u20A61,500');
page = page.replace(/\?2,000/g, '\u20A62,000');
page = page.replace(/\?500/g, '\u20A6500');
page = page.replace(/\?800/g, '\u20A6800');

// Fix Become a Runner button to be more distinct and add an icon
page = page.replace(
    'import { Home, Zap, Search, ChevronRight, MapPin, ShieldCheck, Edit3 } from \'lucide-react\';',
    'import { Home, Zap, Search, ChevronRight, MapPin, ShieldCheck, Edit3, UserPlus } from \'lucide-react\';'
);
page = page.replace(
    '<Link href="/register/agent" className="bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-bold text-center transition-colors">',
    '<Link href="/register/agent" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-center transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30">'
);
page = page.replace(
    'Become a Runner\n                                    </Link>',
    '<UserPlus className="w-5 h-5" /> Become a Runner\n                                    </Link>'
);

fs.writeFileSync('app/page.tsx', page, 'utf8');

// 2. Fix components/home/FeaturedListings.tsx
let featured = fs.readFileSync('components/home/FeaturedListings.tsx', 'utf8');
featured = featured.replace(/\?180,000/g, '\u20A6180,000');
featured = featured.replace(/\?120,000/g, '\u20A6120,000');
featured = featured.replace(/\?350,000/g, '\u20A6350,000');
fs.writeFileSync('components/home/FeaturedListings.tsx', featured, 'utf8');

// 3. Fix components/home/WhyHostelPulse.tsx & add functionality
let why = fs.readFileSync('components/home/WhyHostelPulse.tsx', 'utf8');
why = why.replace(/\?150,000/g, '\u20A6150,000');

// Make the mockup card look functional
why = why.replace(
    '<div className="w-full h-12 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>',
    `<button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-center py-3 rounded-xl font-bold text-sm cursor-pointer transition-colors shadow-md">
                Release Funds
              </button>
              <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 underline cursor-pointer transition-colors">
                Report an Issue
              </div>`
);

// Add functional elements to the other two cards
why = why.replace(
    'What you see is literally what you get.\n                </p>',
    `What you see is literally what you get.
                </p>
                <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold cursor-pointer group-hover:translate-x-1 transition-transform">
                  <PlaySquare className="w-4 h-4" /> Watch Sample Video
                </div>`
);

why = why.replace(
    'Tap one button and your money bounces right back to your wallet. No arguments.\n                </p>',
    `Tap one button and your money bounces right back to your wallet. No arguments.
                </p>
                <div className="mt-6">
                  <button className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    View Refund Policy
                  </button>
                </div>`
);

fs.writeFileSync('components/home/WhyHostelPulse.tsx', why, 'utf8');

console.log('Fixed Naira symbol encoding and added functional UI elements.');
