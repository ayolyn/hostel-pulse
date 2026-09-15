const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

const installAppCode = `{activeSection === 'Install App' && (
                    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <Download className="w-8 h-8 text-[#BEF264]" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Install App</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 font-medium">Add Hostel Pulse to your home screen for quick access, offline support, and a better mobile experience.</p>
                            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-white/5">
                                <h4 className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white mb-2">iOS (Safari)</h4>
                                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside font-medium">
                                    <li>Tap the <span className="font-bold">Share</span> icon at the bottom of the screen.</li>
                                    <li>Scroll down and tap <span className="font-bold">"Add to Home Screen"</span>.</li>
                                    <li>Tap <span className="font-bold">"Add"</span> in the top right corner.</li>
                                </ol>
                            </div>
                            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-white/5">
                                <h4 className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white mb-2">Android (Chrome)</h4>
                                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside font-medium">
                                    <li>Tap the <span className="font-bold">Menu (3 dots)</span> icon in the top right.</li>
                                    <li>Tap <span className="font-bold">"Add to Home screen"</span> or <span className="font-bold">"Install app"</span>.</li>
                                    <li>Follow the prompts to add it to your device.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Help & Support */}`;

content = content.replace('{/* Help & Support */}', installAppCode);

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
