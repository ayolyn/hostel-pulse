const fs = require('fs');
let file = fs.readFileSync('components/layout/StudentDashboardShell.tsx', 'utf8');

file = file.replace(/import \{ GlobalSupportWidget \} from '\.\.\/messages\/GlobalSupportWidget';\n/, '');
file = file.replace(/\s*<GlobalSupportWidget \/>\n/, '\n');

fs.writeFileSync('components/layout/StudentDashboardShell.tsx', file, 'utf8');
