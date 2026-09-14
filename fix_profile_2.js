const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');
content = content.replace('<SavedPropertiesTab userId={user?.id || \'\'} />', '<SavedPropertiesTab />');
fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
