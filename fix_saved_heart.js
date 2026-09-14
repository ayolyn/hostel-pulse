const fs = require('fs');
let content = fs.readFileSync('components/dashboard/SavedPropertiesTab.tsx', 'utf8');
content = content.replace(/Tap .* on any hostel to save it here\./g, 'Tap ❤️ on any hostel to save it here.');
fs.writeFileSync('components/dashboard/SavedPropertiesTab.tsx', content, 'utf8');
