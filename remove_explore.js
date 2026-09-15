const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

// Remove Explore from sections
content = content.replace("          { id: 'Explore', icon: MapPin, label: 'Explore Ogbomoso', isLink: true, href: '/explore' }", "");

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
