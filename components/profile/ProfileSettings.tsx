'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Camera, Loader2, Save, Calendar } from 'lucide-react';

export function ProfileSettings() {
    const { user } = useAuth();
    const supabase = createClient();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [dob, setDob] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('avatar_url, dob')
                .eq('id', user.id)
                .single();
                
            if (data) {
                if (data.avatar_url && data.avatar_url !== 'null') {
                    setAvatarUrl(data.avatar_url);
                }
                if (data.dob) {
                    setDob(data.dob);
                }
            }
            setLoading(false);
        };
        
        fetchProfile();
    }, [user, supabase]);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const filePath = `${user?.id}/${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from('public_assets')
                .upload(`avatars/${filePath}`, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('public_assets').getPublicUrl(`avatars/${filePath}`);
            
            setAvatarUrl(data.publicUrl);
            
            // Immediately update the profile so it syncs across the app
            await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user?.id);

        } catch (error: any) {
            console.error('Error uploading avatar:', error.message);
            alert('Error uploading avatar!');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ dob: dob || null })
                .eq('id', user.id);
                
            if (error) throw error;
            
            alert('Profile updated successfully!');
        } catch (error: any) {
            console.error('Error saving profile:', error.message);
            alert('Error saving profile!');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-5">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-5 border border-neutral-200 dark:border-white/10 shadow-sm">
            <h2 className="text-xl font-bold text-black dark:text-white mb-6">Edit Profile</h2>
            
            <div className="flex flex-col gap-5 max-w-md">
                {/* Avatar Section */}
                <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">
                        Profile Picture
                    </label>
                    <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 overflow-hidden flex items-center justify-center">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-neutral-400" />
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="cursor-pointer bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                                <Camera className="w-4 h-4" />
                                Change Photo
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="hidden" 
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                />
                            </label>
                            <p className="text-xs text-neutral-500 mt-2">JPG, GIF or PNG. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* DOB Section */}
                <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                        Date of Birth
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl px-10 py-3 text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#BEF264]"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="mt-4 w-full bg-[#BEF264] text-black font-bold py-3 rounded-xl hover:bg-[#a5d852] transition-colors flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
            
            {/* Student ID Verification Section */}
            <StudentIdUpload />
        </div>
    );
}

// Just importing User icon for the empty state
import { User } from 'lucide-react';
import { StudentIdUpload } from './StudentIdUpload';
