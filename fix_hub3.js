const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

const securityOld = `{activeSection === 'Security' && (
                    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <Lock className="w-8 h-8 text-[#BEF264]" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Security Settings</h3>
                        </div>
                        
                        <div className="max-w-md space-y-6">
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-white/5 pb-2">Change Password</h4>
                                
                                {passwordMsg && (
                                    <div className={\`p-3 rounded-xl text-xs font-bold \${passwordMsg.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}\`}>
                                        {passwordMsg}
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all"
                                    />
                                </div>
                                
                                <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                )}`;

const securityNew = `{activeSection === 'Security' && (
                    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <Lock className="w-8 h-8 text-[#BEF264]" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Account Security</h3>
                        </div>
                        
                        <div className="max-w-xl space-y-8">
                            {/* Change Password Block */}
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-white/5 pb-2">Change Password</h4>
                                
                                {passwordMsg && (
                                    <div className={\`p-3 rounded-xl text-xs font-bold \${passwordMsg.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}\`}>
                                        {passwordMsg}
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Current Password</label>
                                        <input 
                                            type="password" 
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            placeholder="Enter your current password"
                                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">New Password</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Enter your new password"
                                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your new password"
                                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-2 border-transparent focus:border-[#BEF264] outline-none font-black text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <button type="submit" className="w-full bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-[#a6d456] transition-colors mt-2 shadow-lg shadow-[#BEF264]/20">
                                    Update Password
                                </button>
                            </form>

                            {/* Two-Factor Auth */}
                            <div className="space-y-4">
                                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-white/5 pb-2">Two-Factor Authentication</h4>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">Enable 2FA</div>
                                        <div className="text-xs text-gray-500 mt-1">Add an extra layer of security.</div>
                                    </div>
                                    <button 
                                        onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                        className={\`w-14 h-8 rounded-full p-1 transition-colors \${is2FAEnabled ? 'bg-[#BEF264]' : 'bg-gray-200 dark:bg-white/10'}\`}
                                    >
                                        <div className={\`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform \${is2FAEnabled ? 'translate-x-6' : 'translate-x-0'}\`} />
                                    </button>
                                </div>
                            </div>

                            {/* Recent Login Activity */}
                            <div className="space-y-4">
                                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-white/5 pb-2">Recent Login Activity</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-500">Last Login</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{new Date().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-500">Current Device</span>
                                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]" title={typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'}>
                                            {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 30) + '...' : 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-500">Session Expires</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{new Date(Date.now() + 86400000).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Recommendation */}
                            <div className="bg-orange-50 dark:bg-orange-500/10 p-5 rounded-2xl border border-orange-200 dark:border-orange-500/20">
                                <div className="flex gap-4">
                                    <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Security Recommendation</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">For added security, we recommend you log out of all other sessions.</p>
                                        <button className="bg-orange-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
                                            Log Out Other Sessions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'Install App' && (
                    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm animate-in fade-in duration-300 text-center">
                        <div className="w-24 h-24 bg-[#BEF264]/20 rounded-[2rem] mx-auto flex items-center justify-center mb-6 border-4 border-[#BEF264]/30">
                            <Smartphone className="w-12 h-12 text-[#BEF264]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Install HostelPulse</h3>
                        <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto">
                            Add HostelPulse to your home screen for a faster, app-like experience. No app store required!
                        </p>
                        
                        <div className="max-w-md mx-auto space-y-4 text-left">
                            <div className="bg-gray-50 dark:bg-neutral-800/50 p-5 rounded-2xl flex items-start gap-5 border border-gray-100 dark:border-white/5">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">1</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base">iOS (Safari)</h4>
                                    <p className="text-sm text-gray-500 mt-1">Tap the <strong className="text-gray-900 dark:text-white">Share</strong> button at the bottom of your screen, then scroll down and tap <strong className="text-gray-900 dark:text-white">"Add to Home Screen"</strong>.</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-neutral-800/50 p-5 rounded-2xl flex items-start gap-5 border border-gray-100 dark:border-white/5">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">2</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base">Android (Chrome)</h4>
                                    <p className="text-sm text-gray-500 mt-1">Tap the <strong className="text-gray-900 dark:text-white">Menu</strong> icon (3 dots) in the top right, then tap <strong className="text-gray-900 dark:text-white">"Install app"</strong> or <strong className="text-gray-900 dark:text-white">"Add to Home screen"</strong>.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}`;

content = content.replace(securityOld, securityNew);
fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
