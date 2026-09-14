const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

// The original navItems must still be there. Let's find it.
const regex = /const navItems = \[[\s\S]*?\];/;
const newNavItems = `import { Map, Users } from 'lucide-react';

const desktopNavItems = [
    { name: 'HOME', href: '/dashboard/student', icon: Home },
    { name: 'MAP', href: '/explore', icon: Map },
    { name: 'ROOMMATES', href: '/roommates', icon: Users },
    { name: 'SEARCH', href: '/rent', icon: Search },
    { name: 'INSPECT', href: '/dashboard/student?tab=inspections', icon: Calendar },
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

content = content.replace(regex, newNavItems);

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
