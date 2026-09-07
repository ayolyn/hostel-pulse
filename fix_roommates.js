const fs = require('fs');
let file = fs.readFileSync('app/roommates/page.tsx', 'utf8');

file = file.replace("import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';", 
"import { PublicHeader } from '@/components/layout/PublicHeader';\nimport Footer from '@/components/layout/Footer';");

file = file.replace("<StudentDashboardShell>", 
`<div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full flex-grow pb-20">`);

file = file.replace("</StudentDashboardShell>", 
`            </main>
            <Footer />
        </div>`);

fs.writeFileSync('app/roommates/page.tsx', file, 'utf8');
