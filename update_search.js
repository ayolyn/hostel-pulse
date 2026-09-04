const fs = require('fs');
let file = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

// Find the section that contains the graphic and search integration
const searchRegex = /\{\/\* Graphic & Search Integration \*\/\}[\s\S]*?<\/div>\s*<\/motion\.div>\s*<\/section>/;

const newSearchComponent = `{/* Graphic & Search Integration */}
                        <div className="w-full max-w-3xl mx-auto mt-10 z-20">
                            {/* The "Virtual Hub" Graphic - Moved up and made smaller on mobile so search fits */}
                            <motion.div 
                                animate={{ y: [0, -10, 0], rotate: [0, 1, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative mx-auto w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-[#BEF264]/20 to-transparent rounded-[2rem] border border-[#BEF264]/20 flex flex-col items-center justify-center shadow-2xl overflow-hidden mb-12"
                            >
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                                <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-[#BEF264] rounded-2xl flex items-center justify-center shadow-xl mb-3">
                                    <Home className="w-8 h-8 md:w-10 md:h-10 text-black" />
                                </div>
                                <div className="relative z-10 bg-black/60 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-[#BEF264]" />
                                    <span className="text-white font-bold tracking-widest uppercase text-xs md:text-sm">Virtual Hub</span>
                                </div>
                            </motion.div>

                            {/* Redesigned Search Component */}
                            <div className="w-full max-w-xl mx-auto px-4 md:px-0">
                                {/* External Tabs */}
                                <div className="flex items-end gap-2 ml-4">
                                    <button
                                        onClick={() => setActiveTab('rent')}
                                        className={"flex items-center gap-2 px-6 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'rent' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Home className="w-4 h-4" /> Rent
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('gig')}
                                        className={"flex items-center gap-2 px-6 py-3 rounded-t-2xl font-black text-sm transition-all " + (activeTab === 'gig' ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20")}
                                    >
                                        <Zap className="w-4 h-4" /> Gig
                                    </button>
                                </div>

                                {/* Main Search Card */}
                                <div className="bg-white dark:bg-[#111] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-white/5 relative z-10">
                                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
                                        <MapPin className="w-6 h-6 text-gray-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 font-bold text-lg focus:outline-none"
                                            placeholder={activeTab === 'rent' ? "Monthly/Yearly — Search Under-G..." : "What gig do you need?"}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        className="w-full bg-black dark:bg-[#BEF264] hover:bg-gray-900 dark:hover:bg-[#d9f99d] text-white dark:text-black font-black text-lg py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center transition-all"
                                    >
                                        Search <ChevronRight className="w-5 h-5 ml-2" />
                                    </button>
                                </div>
                                
                                <div className="mt-4 text-center md:text-left md:ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Popular: {activeTab === 'rent' ? <span className="text-gray-900 dark:text-white font-bold">Under-G Self-con, Stadium Shops</span> : <span className="text-gray-900 dark:text-white font-bold">Laundry, Web Design</span>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>`;

file = file.replace(searchRegex, newSearchComponent);

fs.writeFileSync('app/LandingPageClient.tsx', file, 'utf8');
console.log('Successfully updated the Search Bar design');
