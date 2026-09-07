const fs = require('fs');
let file = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

// Update imports
file = file.replace(
    /import \{ Home, Zap, Search, ChevronRight, MapPin, ShieldCheck, Edit3, UserPlus, PhoneCall, CheckCircle \} from 'lucide-react';/,
    `import { Home, Zap, Search, ChevronRight, MapPin, ShieldCheck, Edit3, UserPlus, PhoneCall, CheckCircle, Store, Users } from 'lucide-react';`
);

// Update state
file = file.replace(
    /const \[activeTab, setActiveTab\] = useState<'rent' | 'gig'>\('rent'\);/,
    `const [activeTab, setActiveTab] = useState<'rent' | 'gig' | 'market' | 'roommate'>('rent');`
);

// Update handleSearch
file = file.replace(
    `    const handleSearch = () => {
        if (activeTab === "rent") router.push('/rent?q=' + searchQuery);
        else router.push('/services?q=' + searchQuery);
    };`,
    `    const handleSearch = () => {
        if (activeTab === "rent") router.push('/rent?q=' + searchQuery);
        else if (activeTab === "gig") router.push('/services?q=' + searchQuery);
        else if (activeTab === "market") router.push('/market?q=' + searchQuery);
        else if (activeTab === "roommate") router.push('/roommates?q=' + searchQuery);
    };`
);

fs.writeFileSync('app/LandingPageClient.tsx', file, 'utf8');
console.log('Updated imports and state');
