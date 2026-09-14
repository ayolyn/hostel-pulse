const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

const target2 = `            {/* Floating Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="bg-neutral-950 shadow-2xl rounded-[32px] flex items-center h-[64px] pointer-events-auto border border-white/10 relative">`;
const replacement2 = `            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="bg-neutral-950 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-t-3xl flex items-center h-[72px] pointer-events-auto border-t border-white/10 relative">`;
content = content.replace(target2, replacement2);
fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
console.log("Fixed bottom bar");
