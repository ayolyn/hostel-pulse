const fs = require('fs');

const content = `"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
    User, Shield, Heart, Star, AlertTriangle, LogOut, ChevronRight, 
    Lock, FileText, HelpCircle, ShieldCheck, Wallet, Megaphone, Moon, Download, 
    Bookmark, Gavel, Smartphone, ArrowLeft
} from 'lucide-react';
import { DetailedProfileForm } from './DetailedProfileForm';
import { SavedPropertiesTab } from './SavedPropertiesTab';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export function ProfileSettingsHub({ accountData, onUpdate }: { accountData: any, onUpdate: () => void }) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState('menu');
    
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setPasswordMsg('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMsg('New passwords do not match');
            return;
        }
        
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setPasswordMsg(error.message);
            toast.error(error.message);
        } else {
            setPasswordMsg('Password updated successfully');
            toast.success('Password updated successfully');
            setNewPassword('');
            setCurrentPassword('');
            setConfirmPassword('');
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    // Helper to render section items
    const renderMenuItem = (id: string, icon: any, label: string, isToggle: boolean = false, onClick?: () => void) => {
        const Icon = icon;
        return (
            <button 
                key={id}
                onClick={() => {
                    if (isToggle) {
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                    } else if (onClick) {
                        onClick();
                    } else {
                        setActiveSection(id);
                    }
                }}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
            >
                <div className="flex items-center gap-3">
                    <Icon className={\`w-5 h-5 \${id === 'Get Verified' ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}\`} />
                    <span className={\`text-sm font-semibold \${id === 'Get Verified' ? 'text-amber-600 dark:text-amber-500' : 'text-gray-900 dark:text-white'}\`}>
                        {label}
                    </span>
                </div>
                {isToggle ? (
                    <div className={\`w-12 h-6 rounded-full p-1 transition-colors \${theme === 'dark' ? 'bg-[#BEF264]' : 'bg-gray-300'}\`}>
                        <div className={\`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform \${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}\`} />
                    </div>
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
            </button>
        );
    };

    return (
        <div className="max-w-xl mx-auto pb-20">
            {/* MAIN MENU VIEW */}
            {activeSection === 'menu' && (
                <div className="animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 px-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
                        <NotificationIcon />
                    </div>

                    {/* Profile Banner */}
                    <div className="flex flex-col items-center mb-8 px-4">
                        <div className="w-24 h-24 bg-pink-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden border-4 border-white dark:border-neutral-900 shadow-sm">
                            {accountData?.avatar_url ? (
                                <img src={accountData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                accountData?.full_name?.substring(0, 2).toUpperCase() || 'ST'
                            )}
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">{accountData?.full_name || 'Student User'}</h2>
                        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                        <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">{accountData?.role || 'Student'}</p>
                    </div>

                    {/* ACCOUNT SECTION */}
                    <div className="mb-6 px-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Account</h3>
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">
                            {renderMenuItem('Get Verified', ShieldCheck, 'Get Verified', false, () => toast.success('Verification coming soon!'))}
                            {renderMenuItem('Wallet', Wallet, 'Wallet', false, () => router.push('?tab=wallet'))}
                            {renderMenuItem('Refer', Megaphone, 'Refer & Earn', false, () => toast.success('Referral program coming soon!'))}
                            {renderMenuItem('Edit Profile', User, 'Edit Profile')}
                            {renderMenuItem('Security', Shield, 'Security')}
                            {mounted && renderMenuItem('Dark Mode', Moon, 'Dark Mode', true)}
                            {renderMenuItem('Install App', Download, 'Install App')}
                        </div>
                    </div>

                    {/* MY ACTIVITY SECTION */}
                    <div className="mb-6 px-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-2">My Activity</h3>
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">
                            {renderMenuItem('Saved Hostels', Bookmark, 'Saved Hostels')}
                            {renderMenuItem('My Reviews', Star, 'My Reviews', false, () => toast.success('Reviews coming soon!'))}
                            {renderMenuItem('My Disputes', Gavel, 'My Disputes', false, () => toast.success('Disputes coming soon!'))}
                        </div>
                    </div>

                    {/* SUPPORT & LEGAL SECTION */}
                    <div className="mb-8 px-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Support & Legal</h3>
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">
                            {renderMenuItem('Help', HelpCircle, 'Help & Support', false, () => window.location.href='mailto:support@hostelpulse.com')}
                            {renderMenuItem('Privacy', Shield, 'Privacy Policy', false, () => router.push('/privacy'))}
                            {renderMenuItem('Terms', FileText, 'Terms of Service', false, () => router.push('/terms'))}
                        </div>
                    </div>

                    {/* LOGOUT BUTTON */}
                    <div className="px-4 mb-12">
                        <button 
                            onClick={handleLogout}
                            className="w-full py-4 bg-white dark:bg-neutral-900 rounded-3xl font-black text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            )}

            {/* SECURITY SUB-VIEW */}
            {activeSection === 'Security' && (
                <div className="animate-in slide-in-from-right-4 duration-300 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center gap-4 mb-8 pt-4 sm:pt-0">
                        <button onClick={() => setActiveSection('menu')} className="p-2 bg-white dark:bg-neutral-900 rounded-full shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Security</h2>
                    </div>

                    {/* Change Password Block */}
                    <div className="mb-6">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3 ml-2">Change Password</h3>
                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Current Password</label>
                                <input 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    placeholder="Enter your current password"
                                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <button 
                                onClick={handlePasswordChange}
                                className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl mt-2 hover:bg-amber-600 transition-colors"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>

                    {/* 2FA Block */}
                    <div className="mb-6">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3 ml-2">Two-Factor Authentication</h3>
                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">Enable 2FA</div>
                                <div className="text-xs text-gray-500">Add an extra layer of security.</div>
                            </div>
                            <button 
                                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                className={\`w-12 h-6 rounded-full p-1 transition-colors \${is2FAEnabled ? 'bg-amber-500' : 'bg-gray-200 dark:bg-white/10'}\`}
                            >
                                <div className={\`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform \${is2FAEnabled ? 'translate-x-6' : 'translate-x-0'}\`} />
                            </button>
                        </div>
                    </div>

                    {/* Recent Login Activity */}
                    <div className="mb-6">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3 ml-2">Recent Login Activity</h3>
                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3">
                                <span className="text-xs text-gray-500">Last Login</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">{new Date().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3">
                                <span className="text-xs text-gray-500">Current Device</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[150px]" title={typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'}>
                                    {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 30) + '...' : 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Session Expires</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(Date.now() + 86400000).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Recommendation */}
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-5 rounded-3xl border border-orange-100 dark:border-orange-900/30 mb-8">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Security Recommendation</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">For added security, we recommend you log out of all other sessions.</p>
                                <button className="bg-amber-500 text-white font-bold py-2 px-6 rounded-xl text-sm hover:bg-amber-600 transition-colors">
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INSTALL APP SUB-VIEW */}
            {activeSection === 'Install App' && (
                <div className="animate-in slide-in-from-right-4 duration-300 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center gap-4 mb-8 pt-4 sm:pt-0">
                        <button onClick={() => setActiveSection('menu')} className="p-2 bg-white dark:bg-neutral-900 rounded-full shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Install HostelPulse</h2>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 text-center">
                        <div className="w-20 h-20 bg-[#BEF264]/20 rounded-3xl mx-auto flex items-center justify-center mb-6">
                            <Smartphone className="w-10 h-10 text-[#84cc16]" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Install the Web App</h3>
                        <p className="text-gray-500 text-sm mb-8">
                            Add HostelPulse to your home screen for a faster, app-like experience. No app store required!
                        </p>
                        
                        <div className="space-y-4 text-left">
                            <div className="bg-gray-50 dark:bg-[#0a0a0a] p-4 rounded-2xl flex items-start gap-4 border border-gray-100 dark:border-white/5">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-blue-600 dark:text-blue-400">1</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">iOS (Safari)</h4>
                                    <p className="text-xs text-gray-500 mt-1">Tap the <strong>Share</strong> button at the bottom of your screen, then scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-[#0a0a0a] p-4 rounded-2xl flex items-start gap-4 border border-gray-100 dark:border-white/5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">2</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Android (Chrome)</h4>
                                    <p className="text-xs text-gray-500 mt-1">Tap the <strong>Menu</strong> icon (3 dots) in the top right, then tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PROFILE SUB-VIEW */}
            {activeSection === 'Edit Profile' && (
                <div className="animate-in slide-in-from-right-4 duration-300 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center gap-4 mb-6 pt-4 sm:pt-0">
                        <button onClick={() => setActiveSection('menu')} className="p-2 bg-white dark:bg-neutral-900 rounded-full shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                    </div>
                    <DetailedProfileForm 
                        account={accountData}
                        userId={user?.id || ''}
                        onUpdate={() => {
                            onUpdate();
                            setActiveSection('menu');
                        }}
                    />
                </div>
            )}

            {/* SAVED HOSTELS SUB-VIEW */}
            {activeSection === 'Saved Hostels' && (
                <div className="animate-in slide-in-from-right-4 duration-300 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center gap-4 mb-6 pt-4 sm:pt-0">
                        <button onClick={() => setActiveSection('menu')} className="p-2 bg-white dark:bg-neutral-900 rounded-full shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Hostels</h2>
                    </div>
                    <SavedPropertiesTab userId={user?.id || ''} />
                </div>
            )}
        </div>
    );
}

// Simple Notification icon component for the header
function NotificationIcon() {
    return (
        <button className="relative p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-950"></span>
        </button>
    );
}
`;

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
console.log("Rewritten ProfileSettingsHub successfully");
