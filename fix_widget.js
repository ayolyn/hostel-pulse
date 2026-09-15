const fs = require('fs');
let content = fs.readFileSync('components/messages/GlobalSupportWidget.tsx', 'utf8');

if (!content.includes('usePathname')) {
    content = content.replace("import { useAuth } from '../providers/AuthProvider';", "import { useAuth } from '../providers/AuthProvider';\nimport { usePathname } from 'next/navigation';");
}

if (!content.includes('pathname.includes')) {
    content = content.replace("const { user } = useAuth();", "const { user } = useAuth();\n    const pathname = usePathname();\n\n    if (pathname && (pathname.includes('/messages/') || pathname.includes('/chat/'))) return null;");
}

fs.writeFileSync('components/messages/GlobalSupportWidget.tsx', content, 'utf8');
