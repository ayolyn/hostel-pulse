const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

// Remove StudentSidebar import
content = content.replace("import { StudentSidebar } from './StudentSidebar';", "");
content = content.replace("import { usePortal } from '@/components/auth/PortalGuard';", "");

// Remove usePortal call and state destructuring
const portalRegex = /const portalContext = usePortal\(\);[\s\S]*?const setSidebarOpen = portalContext\?\.setSidebarOpen \|\| \(\(\) => \{\}\);/m;
content = content.replace(portalRegex, "");

// Remove the Hamburger button from Mobile Header
const hamburgerRegex = /<button onClick=\{toggleSidebar\} className="lg:hidden p-2 text-gray-500 hover:text-black dark:hover:text-white">[\s\S]*?<\/button>/m;
content = content.replace(hamburgerRegex, "");

// Remove the <StudentSidebar /> component rendering
const sidebarComponentRegex = /\{\/\* Sidebar \*\/\}\s*<StudentSidebar[\s\S]*?\/>/m;
content = content.replace(sidebarComponentRegex, "");

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
