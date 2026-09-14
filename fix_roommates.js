const fs = require('fs');
let content = fs.readFileSync('components/dashboard/RoommatesTab.tsx', 'utf8');

// 1. Add myProfileData state and import PulseMapbox if not already there
if (!content.includes('import PulseMapbox')) {
    content = content.replace("import { toast } from 'react-hot-toast';", "import { toast } from 'react-hot-toast';\nimport PulseMapbox from '@/components/map/PulseMapbox';");
}
content = content.replace(
    'const [hasProfile, setHasProfile] = useState(false);',
    'const [hasProfile, setHasProfile] = useState(false);\n    const [myProfileData, setMyProfileData] = useState<any>(null);'
);

// 2. Save myProfile to state
content = content.replace(
    'if (myProfile) {\n                    setHasProfile(true);',
    'if (myProfile) {\n                    setHasProfile(true);\n                    setMyProfileData(myProfile);'
);

// 3. Render it inside the hasProfile view
const targetRender = `            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#BEF264]" />
                        Roommate Discovery
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Connect with potential roommates looking for shared spaces.</p>
                </div>
                <button 
                    onClick={() => setHasProfile(false)}
                    className="bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                    Edit Profile
                </button>
            </div>

            {profiles.length === 0 ? (`;

const replaceRender = `            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#BEF264]" />
                        Roommate Discovery
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Connect with potential roommates looking for shared spaces.</p>
                </div>
            </div>

            {myProfileData && (
                <div className="bg-[#BEF264]/10 border border-[#BEF264]/30 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#0D9488] mb-1">Your Active Profile</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">You are visible to other students looking for a roommate in {myProfileData.preferred_zone}.</p>
                    </div>
                    <button 
                        onClick={() => setHasProfile(false)}
                        className="shrink-0 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-md transition-all border border-gray-200 dark:border-white/10"
                    >
                        Edit My Profile
                    </button>
                </div>
            )}

            <div className="mb-8">
                <PulseMapbox snapMode={true} activeCategory="roommates" />
            </div>

            <div className="mb-6 flex items-center gap-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Available Roommates</h3>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            </div>

            {profiles.length === 0 ? (`;

content = content.replace(targetRender, replaceRender);

fs.writeFileSync('components/dashboard/RoommatesTab.tsx', content, 'utf8');
console.log("Fixed RoommatesTab");
