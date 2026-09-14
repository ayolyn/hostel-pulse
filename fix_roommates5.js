const fs = require('fs');
let content = fs.readFileSync('components/dashboard/RoommatesTab.tsx', 'utf8');

// Replace the data fetching logic to not fail if single() fails
const oldFetch = `            try {
                // Check if current user has a profile
                const { data: myProfile, error: myError } = await supabase
                    .from('roommate_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (myProfile) {
                    setHasProfile(true);
                    
                    // Fetch other profiles
                    const { data: otherProfiles, error: othersError } = await supabase
                        .from('roommate_profiles')
                        .select('*')
                        .neq('user_id', userId);

                    if (othersError) throw othersError;

                    const safeProfiles = otherProfiles || [];
                    
                    // Manually fetch student account data to avoid FK ambiguity
                    if (safeProfiles.length > 0) {
                        const userIds = safeProfiles.map((p: any) => p.user_id);
                        const { data: students, error: studentsError } = await supabase
                            .from('student_accounts')
                            .select('id, full_name, avatar_url, level')
                            .in('id', userIds);
                            
                        if (studentsError) console.error("Error fetching student accounts:", studentsError);
                        
                        const enrichedProfiles = safeProfiles.map((p: any) => {
                            const student = (students || []).find((s: any) => s.id === p.user_id);
                            return {
                                ...p,
                                full_name: student?.full_name || 'Anonymous Student',
                                avatar_url: student?.avatar_url || null,
                                level: student?.level || ''
                            };
                        });
                        
                        setProfiles(enrichedProfiles);
                    }
                }
            } catch (error: any) {`;

const newFetch = `            try {
                // Check if current user has a profile WITHOUT failing if not found
                const { data: myProfileList, error: myError } = await supabase
                    .from('roommate_profiles')
                    .select('*')
                    .eq('user_id', userId);

                const myProfile = myProfileList && myProfileList.length > 0 ? myProfileList[0] : null;

                if (myProfile) {
                    setHasProfile(true);
                }
                
                // Fetch other profiles regardless of if they have a profile
                const { data: otherProfiles, error: othersError } = await supabase
                    .from('roommate_profiles')
                    .select('*')
                    .neq('user_id', userId);

                if (othersError) throw othersError;

                const safeProfiles = otherProfiles || [];
                
                // Manually fetch student account data to avoid FK ambiguity
                if (safeProfiles.length > 0) {
                    const userIds = safeProfiles.map((p: any) => p.user_id);
                    const { data: students, error: studentsError } = await supabase
                        .from('student_accounts')
                        .select('id, full_name, avatar_url, level')
                        .in('id', userIds);
                        
                    if (studentsError) console.error("Error fetching student accounts:", studentsError);
                    
                    const enrichedProfiles = safeProfiles.map((p: any) => {
                        const student = (students || []).find((s: any) => s.id === p.user_id);
                        return {
                            ...p,
                            full_name: student?.full_name || 'Anonymous Student',
                            avatar_url: student?.avatar_url || null,
                            level: student?.level || ''
                        };
                    });
                    
                    setProfiles(enrichedProfiles);
                }
            } catch (error: any) {`;

content = content.replace(oldFetch, newFetch);

// The user also wants to edit profile and map visible to everyone.
// So let's replace the `if (!hasProfile)` block!
const oldNoProfile = `    if (!hasProfile) {
        return (
            <div className="max-w-2xl mx-auto px-4 pb-20">
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 text-center border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="w-20 h-20 bg-[#BEF264]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-[#BEF264]" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">Join Roommate Network</h2>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Create a profile to discover and connect with other students looking for roommates.</p>
                    
                    <form onSubmit={handleCreateProfile} className="space-y-4 max-w-md mx-auto text-left">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Maximum Budget (₦)</label>
                            <input 
                                type="number" 
                                required
                                value={budgetMax}
                                onChange={e => setBudgetMax(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#BEF264] transition-colors"
                                placeholder="e.g. 150000"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Sleep</label>
                                <select 
                                    value={sleepSchedule}
                                    onChange={e => setSleepSchedule(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#BEF264] transition-colors appearance-none"
                                >
                                    <option value="Early Bird">Early Bird</option>
                                    <option value="Night Owl">Night Owl</option>
                                    <option value="Flexible">Flexible</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Cleanliness</label>
                                <select 
                                    value={cleanliness}
                                    onChange={e => setCleanliness(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#BEF264] transition-colors appearance-none"
                                >
                                    <option value="Very Clean">Very Clean</option>
                                    <option value="Average">Average</option>
                                    <option value="Messy">Messy</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Short Bio</label>
                            <textarea 
                                required
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#BEF264] transition-colors resize-none"
                                placeholder="What are you looking for in a roommate?"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-black dark:bg-[#BEF264] text-white dark:text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                        >
                            {submitting ? 'Creating...' : 'Create Profile'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }`;

const newNoProfile = `    const profileForm = (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 text-center border border-gray-100 dark:border-white/5 shadow-sm mb-6">
            <div className="w-20 h-20 bg-[#BEF264]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-[#BEF264]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">{hasProfile ? 'Update Roommate Profile' : 'Join Roommate Network'}</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">{hasProfile ? 'Update your roommate preferences below.' : 'Create a profile to discover and connect with other students looking for roommates.'}</p>
            
            <form onSubmit={handleCreateProfile} className="space-y-4 max-w-md mx-auto text-left">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Maximum Budget (₦)</label>
                    <input 
                        type="number" 
                        required
                        value={budgetMax}
                        onChange={e => setBudgetMax(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#BEF264] transition-colors"
                        placeholder="e.g. 150000"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Sleep</label>
                        <select 
                            value={sleepSchedule}
                            onChange={e => setSleepSchedule(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#BEF264] transition-colors appearance-none"
                        >
                            <option value="Early Bird">Early Bird</option>
                            <option value="Night Owl">Night Owl</option>
                            <option value="Flexible">Flexible</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Cleanliness</label>
                        <select 
                            value={cleanliness}
                            onChange={e => setCleanliness(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#BEF264] transition-colors appearance-none"
                        >
                            <option value="Very Clean">Very Clean</option>
                            <option value="Average">Average</option>
                            <option value="Messy">Messy</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Short Bio</label>
                    <textarea 
                        required
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#BEF264] transition-colors resize-none"
                        placeholder="What are you looking for in a roommate?"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-black dark:bg-[#BEF264] text-white dark:text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                >
                    {submitting ? 'Saving...' : (hasProfile ? 'Update Profile' : 'Create Profile')}
                </button>
            </form>
        </div>
    );`;

content = content.replace(oldNoProfile, newNoProfile);

// Find where PulseMapbox is rendered
content = content.replace(`<PulseMapbox 
                            style="light" 
                            activeCategory="roommates"
                        />`, `{!hasProfile && profileForm}\n                        <PulseMapbox \n                            style="light" \n                            activeCategory="roommates"\n                        />`);

fs.writeFileSync('components/dashboard/RoommatesTab.tsx', content, 'utf8');
