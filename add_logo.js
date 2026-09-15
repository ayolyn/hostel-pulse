const fs = require('fs');
let content = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

// Add import if not present
if (!content.includes('HostelPulseLogo')) {
    content = content.replace("import { ThemeToggle } from '../ui/ThemeToggle';", "import { ThemeToggle } from '../ui/ThemeToggle';\nimport { HostelPulseLogo } from '../ui/HostelPulseLogo';");
}

// Replace the empty left side on mobile
const oldHeaderLeft = `<span className="text-[12px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-3 py-1.5 rounded-full hidden sm:block">HP Student</span>`;
const newHeaderLeft = `<div className="sm:hidden flex items-center">
                          <HostelPulseLogo variant="icon" className="w-8 h-8" />
                      </div>
                      <span className="text-[12px] font-black uppercase tracking-widest text-[#BEF264] bg-black px-3 py-1.5 rounded-full hidden sm:block">HP Student</span>`;

content = content.replace(oldHeaderLeft, newHeaderLeft);

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', content, 'utf8');
