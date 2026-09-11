const fs = require('fs');
let file = fs.readFileSync('components/layout/StudentSidebar.tsx', 'utf8');

file = file.replace("import { Settings, User } from 'lucide-react';", "import { Settings } from 'lucide-react';");

fs.writeFileSync('components/layout/StudentSidebar.tsx', file, 'utf8');
