'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, MapPin, CheckCircle, X, MessageCircle, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CAMPUS_ZONES } from '@/lib/constants';

interface PostRoommateRequestProps {
    onClose?: () => void;
    onSuccess?: () => void;
}

export function PostRoommateRequest({ onClose, onSuccess }: PostRoommateRequestProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [checkingVerification, setCheckingVerification] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [stopping, setStopping] = useState(false);

    useEffect(() => {
        async function checkVerification() {
            setCheckingVerification(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('student_id_url')
                    .eq('id', user.id)
                    .single();
                setIsVerified(profile?.student_id_url !== null);

                // Fetch existing roommate preferences
                const { data: account } = await supabase
                    .from('student_accounts')
                    .select('looking_for_roommate, preferred_zone, roommate_metadata')
                    .eq('id', user.id)
                    .single();
                
                if (account?.looking_for_roommate) {
                    setIsEditing(true);
                    setFormData({
                        budget: account.roommate_metadata?.budget || '',
                        preferred_zone: account.preferred_zone || 'Under-G',
                        custom_zone: locations.includes(account.preferred_zone || '') ? '' : account.preferred_zone || '',
                        habits: account.roommate_metadata?.habits || '',
                        gender_preference: account.roommate_metadata?.gender_preference || 'Any'
                    });
                    // Adjust preferred zone to 'Other' if it's not in the default list and is populated
                    if (account.preferred_zone && !locations.includes(account.preferred_zone)) {
                        setFormData(prev => ({ ...prev, preferred_zone: 'Other', custom_zone: account.preferred_zone }));
                    }
                }
            }
            setCheckingVerification(false);
        }
        checkVerification();
    }, [supabase]);
    const [formData, setFormData] = useState({
        budget: '',
        preferred_zone: CAMPUS_ZONES[0],
        custom_zone: '',
        habits: '',
        gender_preference: 'Any'
    });

    const locations = [...CAMPUS_ZONES, 'Other'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const finalZone = formData.preferred_zone === 'Other' ? formData.custom_zone : formData.preferred_zone;
        
        const { error } = await supabase
            .from('student_accounts')
            .update({
                looking_for_roommate: true,
                roommate_metadata: {
                    ...formData,
                    preferred_zone: finalZone
                },
                preferred_zone: finalZone
            })
            .eq('id', user.id);

        setLoading(false);
        if (!error) {
            toast.success(isEditing ? 'Preferences updated!' : 'Request posted successfully!');
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } else {
            console.error('Error posting request:', error);
            toast.error('Failed to post request. Please try again.');
        }
    };

    const handleStopLooking = async () => {
        setStopping(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('student_accounts')
            .update({ looking_for_roommate: false })
            .eq('id', user.id);

        setStopping(false);
        if (!error) {
            toast.success('You have been removed from the roommate discovery pool.');
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } else {
            toast.error('Failed to stop looking. Please try again.');
        }
    };

    if (checkingVerification) {
        return (
            <div className="bg-white dark:bg-neutral-900 p-12 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#BEF264] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-gray-50 dark:bg-neutral-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 text-center relative max-w-xl mx-auto">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <Lock size={48} className="text-gray-300 dark:text-gray-600 mb-6 mx-auto" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Market Locked</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-sm">Upload your Student ID in the Profile section to unlock.</p>
                <button 
                    onClick={() => {
                        if (onClose) onClose();
                        window.location.href = '/dashboard/student?tab=profile';
                    }}
                    className="bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:scale-105 transition-all shadow-xl"
                >
                    Go to Profile →
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 w-full max-w-xl mx-auto shadow-2xl relative">
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="mb-8 text-center sm:text-left">
                <div className="w-16 h-16 bg-[#BEF264]/10 rounded-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                    <Users className="w-8 h-8 text-[#BEF264]" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-1">
                    {isEditing ? 'Edit Preferences' : 'Find a Roommate'}
                </h2>
                <p className="text-gray-500 font-medium text-sm">
                    {isEditing ? 'Update your roommate preferences or unlist yourself.' : 'Fill in your preferences to match with others.'}
                </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Your Budget (₦ / yr)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">₦</div>
                            <input 
                                type="number" 
                                required
                                placeholder="e.g. 150000"
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm"
                                value={formData.budget}
                                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Preferred Area</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select 
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm appearance-none"
                                value={formData.preferred_zone}
                                onChange={(e) => setFormData({...formData, preferred_zone: e.target.value})}
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {formData.preferred_zone === 'Other' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Specify Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                required
                                placeholder="Enter your preferred location"
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all font-medium text-sm"
                                value={formData.custom_zone}
                                onChange={(e) => setFormData({...formData, custom_zone: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">About You & Habits</label>
                    <div className="relative">
                        <MessageCircle className="absolute left-4 top-5 w-4 h-4 text-gray-400" />
                        <textarea 
                            required
                            placeholder="e.g. 200L Engineering student, quiet, non-smoker, early riser..."
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#BEF264] transition-all h-32 font-medium text-sm resize-none"
                            value={formData.habits}
                            onChange={(e) => setFormData({...formData, habits: e.target.value})}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" required className="mt-1 w-4 h-4 accent-[#BEF264]" />
                        <span className="text-xs text-gray-500 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            I agree to follow the community guidelines and understand that my profile will be visible to other students looking for roommates.
                        </span>
                    </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        type="submit"
                        disabled={loading || stopping}
                        className="flex-1 bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black font-black uppercase tracking-widest text-xs py-5 rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <CheckCircle className="w-5 h-5" />
                        )}
                        {isEditing ? 'Save Changes' : 'Post My Request'}
                    </button>
                    
                    {isEditing && (
                        <button 
                            type="button"
                            onClick={handleStopLooking}
                            disabled={loading || stopping}
                            className="bg-red-50 text-red-500 font-black uppercase tracking-widest text-xs py-5 px-6 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {stopping ? (
                                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                            Stop Looking
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
