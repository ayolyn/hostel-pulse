const fs = require('fs');
let file = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

const oldTabsRegex = /\{\/\* External Tabs \*\/\}[\s\S]*?\{\/\* Main Search Card \*\/\}/;

const newTabs = `{/* External Tabs */}
                                <div className="flex items-end gap-1.5 ml-4 overflow-x-auto no-scrollbar pr-4">
                                    <button
                                        onClick={() => setActiveTab('rent')}
                                        className={"flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'rent' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Home className="w-4 h-4" /> Rent
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('gig')}
                                        className={"flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'gig' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Zap className="w-4 h-4" /> Gig
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('market')}
                                        className={"flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'market' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Store className="w-4 h-4" /> Market
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('roommate')}
                                        className={"flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'roommate' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Users className="w-4 h-4" /> Roommate
                                    </button>
                                </div>

                                {/* Main Search Card */}`;

file = file.replace(oldTabsRegex, newTabs);

const oldInputRegex = /<input\s+type="text"[\s\S]*?\/>/;
const newInput = `<input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 font-bold text-lg md:text-xl focus:outline-none"
                                            placeholder={
                                                activeTab === 'rent' ? "Monthly/Yearly — Search Under-G..." : 
                                                activeTab === 'gig' ? "Search for laundry, design, etc..." :
                                                activeTab === 'market' ? "Search phones, laptops, books..." :
                                                "Find your ideal roommate..."
                                            }
                                        />`;
file = file.replace(oldInputRegex, newInput);

const oldPopularRegex = /Popular:[\s\S]*?<\/div>/;
const newPopular = `Popular: 
                                    {activeTab === 'rent' && <span className="text-gray-900 dark:text-white font-bold ml-1">Under-G Self-con, Stadium Shops</span>}
                                    {activeTab === 'gig' && <span className="text-gray-900 dark:text-white font-bold ml-1">Laundry, Web Design</span>}
                                    {activeTab === 'market' && <span className="text-gray-900 dark:text-white font-bold ml-1">iPhone 13, Generators</span>}
                                    {activeTab === 'roommate' && <span className="text-gray-900 dark:text-white font-bold ml-1">Adenike Area, Male Only</span>}
                                </div>`;
file = file.replace(oldPopularRegex, newPopular);

fs.writeFileSync('app/LandingPageClient.tsx', file, 'utf8');
console.log('Updated tabs UI');
