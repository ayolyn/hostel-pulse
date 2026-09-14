const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

const targetMenuEnd = `                    <Link href="/terms" className="w-full flex items-center gap-3 p-3 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
                        <FileText className="w-5 h-5" />
                        <span className="font-bold text-sm">Terms of Service</span>
                    </Link>
                </div>
            </div>`;

const replaceMenuEnd = `                    <Link href="/terms" className="w-full flex items-center gap-3 p-3 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
                        <FileText className="w-5 h-5" />
                        <span className="font-bold text-sm">Terms of Service</span>
                    </Link>
                </div>

                {/* Explore Map Button */}
                <Link href="/explore" className="mt-4 w-full bg-[#BEF264] text-black px-6 py-4 rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(190,242,100,0.15)] block text-center">
                    <MapPin className="w-5 h-5" /> Explore Ogbomoso
                </Link>
            </div>`;

content = content.replace(targetMenuEnd, replaceMenuEnd);
// Also need to import MapPin
if (!content.includes('MapPin')) {
    content = content.replace('Download, Smartphone', 'Download, Smartphone, MapPin');
}

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
