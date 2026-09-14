const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

const oldNavItems = `const navItems = [
    { name: 'HOME', href: '/dashboard/student', icon: Home },
    { name: 'INSPECT', href: '/dashboard/student?tab=inspections', icon: Calendar },
    { name: 'SEARCH', href: '/rent', icon: Search },
    { name: 'INBOX', href: '/dashboard/student?tab=messages', icon: MessageSquare },
    { name: 'PROFILE', href: '/dashboard/student?tab=profile', icon: User },
];`;

const newNavItems = `import { Map, Users } from 'lucide-react';

const desktopNavItems = [
    { name: 'HOME', href: '/dashboard/student', icon: Home },
    { name: 'MAP', href: '/explore', icon: Map },
    { name: 'ROOMMATES', href: '/roommates', icon: Users },
    { name: 'SEARCH', href: '/rent', icon: Search },
    { name: 'INBOX', href: '/dashboard/student?tab=messages', icon: MessageSquare },
    { name: 'PROFILE', href: '/dashboard/student?tab=profile', icon: User },
];

const mobileNavItems = [
    { name: 'HOME', href: '/dashboard/student', icon: Home },
    { name: 'SEARCH', href: '/rent', icon: Search },
    { name: 'MAP', href: '/explore', icon: Map },
    { name: 'INBOX', href: '/dashboard/student?tab=messages', icon: MessageSquare },
    { name: 'PROFILE', href: '/dashboard/student?tab=profile', icon: User },
];`;

content = content.replace(oldNavItems, newNavItems);

// Now update the mappings
content = content.replace('{navItems.map((item) => (', '{desktopNavItems.map((item) => (');
content = content.replace('navItems.findIndex(item => isActive(item.name))', 'mobileNavItems.findIndex(item => isActive(item.name))');
content = content.replace('width: `${100 / navItems.length}%`', 'width: `${100 / mobileNavItems.length}%`');
content = content.replace('{navItems.map((item, index) => {', '{mobileNavItems.map((item, index) => {');

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
