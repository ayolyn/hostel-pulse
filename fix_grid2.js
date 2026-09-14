const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf8');

const target = /\{\/\* New Professional Buyer Hub Metrics \*\/\}[\s\S]*?\{\/\* Saved Hostels \*\/\}/;

const replacement = `{/* Unified Dashboard Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        
                        {/* 1. Verified Status */}
                        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden">
                            <ShieldCheck className={\`w-6 h-6 \${accountData?.is_approved ? 'text-[#BEF264]' : 'text-gray-400'}\`} />
                            <div>
                                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {accountData?.is_approved ? 'Verified Member' : 'Unverified'}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">
                                    {accountData?.is_approved ? 'Platform Access' : 'Upload ID'}
                                </p>
                            </div>
                            {!accountData?.is_approved && (
                                <div className="absolute top-4 right-4 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </div>
                            )}
                        </div>

                        {/* 2. Pending Inspections */}
                        <Link 
                            href="/dashboard/student?tab=inspections"
                            className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 text-left hover:scale-105 transition-transform active:scale-95"
                        >
                            <Calendar className="w-6 h-6 text-gray-900 dark:text-white" />
                            <div>
                                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {inspections.filter(i => i.status === 'Pending').length} Pending
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Inspections</p>
                            </div>
                        </Link>
                        
                        {/* 3. Campus Market */}
                        <Link 
                            href="?tab=market"
                            className="bg-[#BEF264]/10 border border-[#BEF264]/20 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 text-left hover:bg-[#BEF264]/20 transition-all active:scale-95"
                        >
                            <ShoppingBag className="w-6 h-6 text-[#BEF264]" />
                            <div>
                                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Market</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Buy & Sell</p>
                            </div>
                        </Link>

                        {/* 4. Roommates */}
                        <Link 
                            href="?tab=roommates"
                            className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all active:scale-95"
                        >
                            <Users className="w-6 h-6 text-blue-500" />
                            <div>
                                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Roommates</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Find Match</p>
                            </div>
                        </Link>
                        
                        {/* 5. Campus Gigs */}
                        <Link 
                            href="?tab=gigs"
                            className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 text-left hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all active:scale-95"
                        >
                            <Star className="w-6 h-6 text-purple-500" />
                            <div>
                                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Gigs</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Micro Jobs</p>
                            </div>
                        </Link>

                        {/* 6. Wallet */}
                        <Link 
                            href="?tab=wallet"
                            className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 text-left hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all active:scale-95"
                        >
                            <Wallet className="w-6 h-6 text-orange-500" />
                            <div>
                                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Wallet</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Manage Funds</p>
                            </div>
                        </Link>
                    </div>

                    {/* Saved Hostels */}`;

content = content.replace(target, replacement);
fs.writeFileSync('app/dashboard/student/page.tsx', content, 'utf8');
console.log("Fixed dashboard");
