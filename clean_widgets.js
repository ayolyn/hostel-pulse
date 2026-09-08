const fs = require('fs');

const filesToClean = [
    'app/dashboard/agent/layout.tsx',
    'components/layout/LandlordDashboardShell.tsx',
    'components/layout/NonStudentDashboardShell.tsx'
];

filesToClean.forEach(filePath => {
    let file = fs.readFileSync(filePath, 'utf8');
    file = file.replace(/import \{ GlobalSupportWidget \} from '[^']+';\n/, '');
    file = file.replace(/\s*<GlobalSupportWidget \/>\n/, '\n');
    fs.writeFileSync(filePath, file, 'utf8');
});

// Now inject into layout.tsx
let layoutFile = fs.readFileSync('app/layout.tsx', 'utf8');
if (!layoutFile.includes('GlobalSupportWidget')) {
    layoutFile = layoutFile.replace(
        /import \{ GlobalAlertsListener \} from "@\/components\/providers\/GlobalAlertsListener";\n/,
        "import { GlobalAlertsListener } from \"@/components/providers/GlobalAlertsListener\";\nimport { GlobalSupportWidget } from \"@/components/messages/GlobalSupportWidget\";\n"
    );
    layoutFile = layoutFile.replace(
        /<ConditionalFooter \/>/,
        "<GlobalSupportWidget />\n                                    <ConditionalFooter />"
    );
    fs.writeFileSync('app/layout.tsx', layoutFile, 'utf8');
}

