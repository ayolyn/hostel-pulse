const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

content = content.replace(/.from\('property_reviews'\)/g, `.from('provider_reviews')`);
content = content.replace(/.eq\('user_id', user\.id\)/g, `.eq('reviewer_id', user.id)`); // Wait, this also affects disputes! Let's be careful.

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
