const fs = require('fs');
let file = fs.readFileSync('components/layout/PublicHeader.tsx', 'utf8');

file = file.replace(
    `                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        target={link.href.startsWith('http') ? "_blank" : undefined}
                                        className="py-4 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 flex items-center justify-between group"
                                    >
                                        {link.name}
                                        <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">?</span>
                                    </Link>
                                ))}`,
    `                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        target={link.href.startsWith('http') ? "_blank" : undefined}
                                        className="px-5 py-4 mb-3 bg-gray-100/50 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#1a1a1a] rounded-2xl text-[1.1rem] font-bold text-gray-900 dark:text-white flex items-center justify-between transition-colors border border-transparent dark:border-white/5"
                                    >
                                        {link.name}
                                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                                    </Link>
                                ))}`
);

fs.writeFileSync('components/layout/PublicHeader.tsx', file, 'utf8');
console.log('Fixed mobile menu');
