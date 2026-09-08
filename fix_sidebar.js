const fs = require('fs');
let file = fs.readFileSync('components/layout/StudentSidebar.tsx', 'utf8');

file = file.replace("{ name: 'Settings', icon: Settings, path: '/dashboard/student?tab=profile' }", "{ name: 'Profile', icon: User, path: '/dashboard/student?tab=profile' }");

if (!file.includes('import { User')) {
    file = file.replace("import { Settings } from 'lucide-react';", "import { Settings, User } from 'lucide-react';");
}

fs.writeFileSync('components/layout/StudentSidebar.tsx', file, 'utf8');
