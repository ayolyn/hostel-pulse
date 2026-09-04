const fs = require('fs');
let page = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

// Replace the old interactive tab search with a sleek funconnect style one
const oldSearch = `<div className="flex overflow-x-auto p-1 bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl mb-4 w-max max-w-full mx-auto hide-scrollbar">
                                {[
                                    { id: 'rent', label: 'Rent a Room', icon: Home },
                                    { id: 'gig', label: 'Book a Gig', icon: Zap }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={"relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 " + (activeTab === tab.id ? "text-black" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="active-tab"
                                                className="absolute inset-0 bg-[#BEF264] rounded-xl shadow-lg"
                                                initial={false}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <tab.icon className={"w-4 h-4 relative z-10 " + (activeTab === tab.id ? "text-black" : "")} />
                                        <span className="relative z-10">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="relative group max-w-2xl mx-auto">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#BEF264] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="block w-full pl-12 pr-32 py-5 bg-white/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#BEF264] focus:bg-white dark:focus:bg-black/60 transition-all text-lg shadow-2xl backdrop-blur-xl"
                                    placeholder={searchPlaceholders[activeTab]}
                                />
                                <div className="absolute inset-y-2 right-2">
                                    <button
                                        onClick={handleSearch}
                                        className="h-full px-8 bg-[#BEF264] hover:bg-[#a6d456] text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-[#BEF264]/20 hover:-translate-y-0.5"
                                    >
                                        GO <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>`;

const newSearch = `<div className="max-w-xl mx-auto w-full mt-12 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-3xl p-2 md:p-3 shadow-2xl flex flex-col md:flex-row gap-2">
                                <div className="flex flex-1 p-1 bg-gray-50 dark:bg-black rounded-2xl">
                                    {[
                                        { id: 'rent', label: 'Rent a Room' },
                                        { id: 'gig', label: 'Book a Gig' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={"relative flex-1 py-3 md:py-4 rounded-xl text-sm font-bold transition-all duration-300 " + (activeTab === tab.id ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")}
                                        >
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="active-tab"
                                                    className="absolute inset-0 bg-emerald-500 rounded-xl shadow-md"
                                                    initial={false}
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center flex-1 bg-gray-50 dark:bg-black rounded-2xl px-4 py-2">
                                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 font-medium focus:outline-none py-3"
                                        placeholder={searchPlaceholders[activeTab]}
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl px-8 py-4 md:py-0 transition-all flex items-center justify-center shadow-lg"
                                >
                                    Search
                                </button>
                            </div>`;

page = page.replace(oldSearch, newSearch);

// Replace accent colors
page = page.replace(/text-emerald-400/g, 'text-emerald-500');

fs.writeFileSync('app/LandingPageClient.tsx', page, 'utf8');
console.log('Fixed LandingPage search bar');
