const fs = require('fs');
let file = fs.readFileSync('components/layout/PublicHeader.tsx', 'utf8');

file = file.replace(
    'import Image from \'next/image\';',
    'import Image from \'next/image\';\nimport { HostelPulseLogo } from \'@/components/ui/HostelPulseLogo\';'
);

file = file.replace(
    '<div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">\n                            <span className="text-emerald-500 font-black text-xl leading-none">H</span>\n                        </div>\n                        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">\n                            HostelPulse\n                        </span>',
    '<HostelPulseLogo size={28} />'
);

file = file.replace(
    '<div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">\n                                        <span className="text-emerald-500 font-black text-xl leading-none">H</span>\n                                    </div>\n                                    <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">\n                                        HostelPulse\n                                    </span>',
    '<HostelPulseLogo size={28} />'
);

fs.writeFileSync('components/layout/PublicHeader.tsx', file, 'utf8');
console.log('Restored original logo to header');
