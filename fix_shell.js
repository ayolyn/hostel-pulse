const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

const target = `<nav className="hidden md:flex items-center gap-6 ml-6">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={\`text-sm font-bold uppercase tracking-widest transition-colors \${isActive(item.name) ? 'text-black dark:text-[#BEF264]' : 'text-gray-400 hover:text-black dark:hover:text-white'}\`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>`;

const replacement = `<nav className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-neutral-200 dark:border-white/10 p-1 rounded-full ml-6">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={\`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 \${isActive(item.name) ? 'bg-black dark:bg-[#BEF264] text-white dark:text-black shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'}\`}
                            >
                                <item.icon className="w-3.5 h-3.5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>`;

content = content.replace(target, replacement);
fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
