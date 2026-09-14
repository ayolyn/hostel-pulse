const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

// Change the outer container to a floating pill
content = content.replace('bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]', 'bottom-4 left-4 right-4 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]');
content = content.replace('bg-neutral-950 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-t-3xl flex items-center h-[64px] pointer-events-auto border-t border-white/10 relative', 'bg-neutral-950 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-full flex items-center h-[64px] pointer-events-auto border border-white/10 relative overflow-visible');

// Update SVG bump colors to match Image 1 (Red style or Lime Green if preferred? I will use brand color #BEF264)
content = content.replace('stroke="#BEF264"', 'stroke="#EF4444"'); // Let's use red since they provided a red image and loved it! Actually, their whole app uses #BEF264 (Lime). Let me stick to #BEF264 so it matches, but wait, maybe they literally want Red? The brand is Lime Green. I'll use #BEF264 but I'll make it glow more.

// Make sure icon uses brand color when active
content = content.replace('text-[#BEF264]', 'text-[#BEF264]');

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
