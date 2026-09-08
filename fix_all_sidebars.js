const fs = require('fs');

const sidebars = [
    'components/layout/StudentSidebar.tsx',
    'components/layout/AgentSidebar.tsx',
    'components/layout/LandlordSidebar.tsx',
    'components/layout/NonStudentSidebar.tsx'
];

sidebars.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let file = fs.readFileSync(filePath, 'utf8');
        
        const pathMatch = filePath.includes('student') ? '/dashboard/student' : 
                          filePath.includes('agent') ? '/dashboard/agent' : 
                          filePath.includes('landlord') ? '/dashboard/landlord' : 
                          '/dashboard/non-student';

        file = file.replace(new RegExp(`\\{ name: 'Settings', icon: Settings, path: '${pathMatch}\\?tab=profile' \\}`), `{ name: 'Profile', icon: User, path: '${pathMatch}?tab=profile' }`);
        
        if (!file.includes('import { User')) {
            file = file.replace(/import \{.*Settings.*\} from 'lucide-react';/, match => {
                if (!match.includes('User')) {
                    return match.replace('Settings', 'Settings, User');
                }
                return match;
            });
        }
        
        fs.writeFileSync(filePath, file, 'utf8');
    }
});
