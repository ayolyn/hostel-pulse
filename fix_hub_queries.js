const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

// Fix Reviews
content = content.replace(
    /from\('property_reviews'\)[\s\S]*?eq\('user_id', user\.id\)/m,
    "from('provider_reviews')\n                    .select('*, properties(title, images)')\n                    .eq('reviewer_id', user.id)"
);

// Fix Disputes
content = content.replace(
    /from\('disputes'\)[\s\S]*?eq\('user_id', user\.id\)/m,
    "from('escrow_transactions')\n                    .select('*, properties(title, images)')\n                    .eq('buyer_id', user.id)\n                    .eq('status', 'disputed')"
);

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
