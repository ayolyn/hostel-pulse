const fs = require('fs');
let widget = fs.readFileSync('components/messages/GlobalSupportWidget.tsx', 'utf8');
if (!widget.includes("import { usePathname }")) {
    widget = widget.replace("import { useAuth } from '@/components/providers/AuthProvider';", "import { useAuth } from '@/components/providers/AuthProvider';\nimport { usePathname } from 'next/navigation';");
}
fs.writeFileSync('components/messages/GlobalSupportWidget.tsx', widget, 'utf8');
