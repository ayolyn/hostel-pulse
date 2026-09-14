const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

const oldSections = `    const sections = [
        { id: 'Edit Profile', icon: User, label: 'Edit Profile' },
        { id: 'Security', icon: Shield, label: 'Security & Login' },
        { id: 'Saved Hostels', icon: Heart, label: 'Saved Hostels' },
        { id: 'My Reviews', icon: Star, label: 'My Reviews' },
        { id: 'My Disputes', icon: AlertTriangle, label: 'My Disputes' },
        { id: 'Install App', icon: Download, label: 'Install App' },
        { id: 'Explore', icon: MapPin, label: 'Explore Ogbomoso', isLink: true, href: '/explore' }
    ];`;

const newSections = `    const sections = [
        { id: 'Edit Profile', icon: User, label: 'Edit Profile' },
        { id: 'Explore', icon: MapPin, label: 'Explore Ogbomoso', isLink: true, href: '/explore' },
        { id: 'Security', icon: Shield, label: 'Security & Login' },
        { id: 'Saved Hostels', icon: Heart, label: 'Saved Hostels' },
        { id: 'My Reviews', icon: Star, label: 'My Reviews' },
        { id: 'My Disputes', icon: AlertTriangle, label: 'My Disputes' },
        { id: 'Install App', icon: Download, label: 'Install App' }
    ];`;

content = content.replace(oldSections, newSections);
fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
