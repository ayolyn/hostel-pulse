const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

// Import StudentSidebar and usePortal
if (!content.includes('import { StudentSidebar }')) {
    content = content.replace('import { Suspense } from \'react\';', 'import { Suspense } from \'react\';\nimport { StudentSidebar } from \'./StudentSidebar\';\nimport { usePortal } from \'@/components/auth/PortalGuard\';');
}

// Add state to StudentDashboardShellContent
const hookInjection = `const pathname = usePathname();`;
const hookReplacement = `const pathname = usePathname();
    const portalContext = usePortal();
    // Safely destructure with fallbacks in case usePortal is used outside provider
    const isSidebarOpen = portalContext?.isSidebarOpen || false;
    const isRetracted = portalContext?.isRetracted || false;
    const toggleSidebar = portalContext?.toggleSidebar || (() => {});
    const toggleRetract = portalContext?.toggleRetract || (() => {});
    const setSidebarOpen = portalContext?.setSidebarOpen || (() => {});`;
content = content.replace(hookInjection, hookReplacement);

// Render sidebar
const renderInjection = `<div className="flex min-h-screen bg-gray-50/50 dark:bg-neutral-950 transition-colors duration-500 pb-32 md:pb-0">`;
const renderReplacement = `<div className="flex min-h-screen bg-gray-50/50 dark:bg-neutral-950 transition-colors duration-500 pb-32 md:pb-0">
            {/* Sidebar */}
            <StudentSidebar
                isOpen={isSidebarOpen}
                isRetracted={isRetracted}
                onClose={() => setSidebarOpen(false)}
                onRetractToggle={toggleRetract}
            />`;
content = content.replace(renderInjection, renderReplacement);

// Hook up the hamburger button
content = content.replace('<button className="lg:hidden p-2', '<button onClick={toggleSidebar} className="lg:hidden p-2');

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
