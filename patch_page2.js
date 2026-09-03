const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Theme fixes & removing the glowing pill
content = content.replace(/className="min-h-screen bg-\[#0a0a0a\] text-white selection:bg-\[#BEF264\]\/30 selection:text-\[#BEF264\]"/g, 'className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white selection:bg-[#BEF264]/30 selection:text-[#BEF264]"');

// Remove the glowing pill entirely
content = content.replace(/<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white\/5 border border-white\/10 text-xs font-bold uppercase tracking-widest text-gray-300 mb-8 backdrop-blur-md">[\s\S]*?<\/div>/, '');

// Hero Text size for mobile
content = content.replace(/text-5xl md:text-7xl lg:text-8xl/g, 'text-4xl sm:text-5xl md:text-7xl lg:text-8xl');

// Tabs responsive
content = content.replace(/className="flex p-1 bg-white\/5 backdrop-blur-xl border border-white\/10 rounded-2xl mb-4 w-max mx-auto"/g, 'className="flex overflow-x-auto p-1 bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl mb-4 w-max max-w-full mx-auto hide-scrollbar"');
content = content.replace(/activeTab === tab\.id \? 'text-black' : 'text-gray-400 hover:text-white'/g, 'activeTab === tab.id ? "text-black" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"');

// Search Bar responsive
content = content.replace(/className="relative bg-white\/5 backdrop-blur-xl border border-white\/10 rounded-3xl p-2 flex items-center shadow-2xl shadow-black\/50"/g, 'className="relative bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-2 flex items-center shadow-xl shadow-gray-200/50 dark:shadow-black/50"');
content = content.replace(/className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-500 py-4 text-lg"/g, 'className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 py-3 sm:py-4 text-base sm:text-lg w-full min-w-0"');
content = content.replace(/<button className="bg-\[#BEF264\] text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-\[#a5d953\] transition-colors">/g, '<button onClick={handleSearch} className="bg-[#BEF264] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-[#a5d953] transition-colors shrink-0">');

// Add handleSearch and useRouter
content = content.replace(/import Link from 'next\/link';/, "import Link from 'next/link';\nimport { useRouter } from 'next/navigation';");
content = content.replace(/const searchPlaceholders = {/g, 'const router = useRouter();\n    const [searchQuery, setSearchQuery] = useState("");\n\n    const handleSearch = () => {\n        if (activeTab === "rent") router.push(`/rent?q=${searchQuery}`);\n        else if (activeTab === "service") router.push(`/services?q=${searchQuery}`);\n        else router.push(`/market?q=${searchQuery}`);\n    };\n\n    const searchPlaceholders = {');
content = content.replace(/type="text"/g, 'type="text"\n                                    value={searchQuery}\n                                    onChange={(e) => setSearchQuery(e.target.value)}\n                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}');

// Card styles (Journey Selector)
content = content.replace(/className="group bg-white\/5 border border-white\/10 rounded-\[2rem\] p-8/g, 'className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm dark:shadow-none');
content = content.replace(/<h3 className="text-2xl font-black text-white mb-2">/g, '<h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">');

// Micro-Gig styles
content = content.replace(/className="bg-\[#111\] border border-white\/10/g, 'className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none');
content = content.replace(/<h3 className="text-2xl font-black mb-2 relative z-10">/g, '<h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 relative z-10">');
content = content.replace(/<h2 className="text-4xl md:text-5xl font-black mb-4">/g, '<h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">');

// The Hustle CTA
content = content.replace(/<h2 className="text-4xl md:text-5xl font-black mb-6">Turn Ogbomoso <br\/>Into Your Office\.<\/h2>/g, '<h2 className="text-3xl md:text-5xl font-black text-white mb-6">Turn Ogbomoso <br className="hidden sm:block"/>Into Your Office.</h2>');

fs.writeFileSync('app/page.tsx', content);
console.log('Fixed app/page.tsx');
