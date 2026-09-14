const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

content = content.replace(
    "import { User, Shield, Heart, Star, AlertTriangle, LogOut, ChevronRight, CheckCircle2, Lock, FileText, HelpCircle, AlertCircle } from 'lucide-react';",
    "import { User, Shield, Heart, Star, AlertTriangle, LogOut, ChevronRight, CheckCircle2, Lock, FileText, HelpCircle, AlertCircle, Download, Smartphone } from 'lucide-react';"
);

content = content.replace(
    "{ id: 'My Disputes', icon: AlertTriangle, label: 'My Disputes' }",
    "{ id: 'My Disputes', icon: AlertTriangle, label: 'My Disputes' },\n        { id: 'Install App', icon: Download, label: 'Install App' }"
);

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
