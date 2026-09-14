const fs = require('fs');
let content = fs.readFileSync('components/dashboard/RoommatesTab.tsx', 'utf8');

const targetFetch = `                // Get other profiles
                const otherProfiles = safeProfiles.filter((p: any) => p.user_id !== userId);
                
                if (otherProfiles.length > 0) {
                    const userIds = otherProfiles.map((p: any) => p.user_id);
                    const { data: students, error: studentsError } = await supabase
                        .from('student_accounts')
                        .select('id, full_name, avatar_url, level')
                        .in('id', userIds);
                        
                    if (studentsError) console.error("Error fetching student accounts:", studentsError);
                    
                    const enrichedProfiles = otherProfiles.map((p: any) => {
                        const student = (students || []).find((s: any) => s.id === p.user_id);
                        return {
                            ...p,
                            full_name: student?.full_name || 'Anonymous Student',
                            avatar_url: student?.avatar_url || null,
                            level: student?.level || ''
                        };
                    });
                    
                    setProfiles(enrichedProfiles);
                } else {
                    setProfiles([]);
                }`;

const replaceFetch = `                // Get all users looking for roommates from student_accounts
                const { data: students, error: studentsError } = await supabase
                    .from('student_accounts')
                    .select('id, full_name, avatar_url, level, looking_for_roommate')
                    .eq('looking_for_roommate', true)
                    .neq('id', userId);
                    
                if (studentsError) console.error("Error fetching student accounts:", studentsError);

                const lookingStudents = students || [];
                
                // Get other profiles
                const otherProfiles = safeProfiles.filter((p: any) => p.user_id !== userId);
                
                // Merge them! If a student is looking for a roommate, show them even if they haven't filled the profile form yet.
                const enrichedProfiles = lookingStudents.map((student: any) => {
                    const profile = otherProfiles.find((p: any) => p.user_id === student.id) || {};
                    return {
                        user_id: student.id,
                        full_name: student.full_name || 'Anonymous Student',
                        avatar_url: student.avatar_url || null,
                        level: student.level || '',
                        budget_max: profile.budget_max || null,
                        preferred_zone: profile.preferred_zone || 'Any Zone',
                        cleanliness: profile.cleanliness || 'Unknown',
                        bio: profile.bio || 'Looking for a roommate.',
                        department: profile.department || ''
                    };
                });
                
                setProfiles(enrichedProfiles);`;

content = content.replace(targetFetch, replaceFetch);
fs.writeFileSync('components/dashboard/RoommatesTab.tsx', content, 'utf8');
