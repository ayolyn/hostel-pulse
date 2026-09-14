const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

const targetReview = `            if (activeSection === 'My Reviews') {
                const { data } = await supabase
                    .from('property_reviews')
                    .select('*, properties(title, images)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                setReviews(data || []);`;

const replaceReview = `            if (activeSection === 'My Reviews') {
                const { data } = await supabase
                    .from('provider_reviews')
                    .select('*, properties(title, images)')
                    .eq('reviewer_id', user.id)
                    .order('created_at', { ascending: false });
                setReviews(data || []);`;

content = content.replace(targetReview, replaceReview);
fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
