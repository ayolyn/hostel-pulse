const fs = require('fs');
let file = fs.readFileSync('app/LandingPageClient.tsx', 'utf8');

file = file.replace(
    "const [activeTab, setActiveTab] = useState<'rent' | 'gig' | 'market' | 'roommate'>('rent');| 'gig'>('rent');",
    "const [activeTab, setActiveTab] = useState<'rent' | 'gig' | 'market' | 'roommate'>('rent');"
);

fs.writeFileSync('app/LandingPageClient.tsx', file, 'utf8');
console.log('Fixed syntax error');
