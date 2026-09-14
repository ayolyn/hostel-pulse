const fs = require('fs');
let content = fs.readFileSync('app/dashboard/student/page.tsx', 'utf8');

const startIndex = content.indexOf('{loading ? (');
const gridIndex = content.indexOf('<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">', startIndex);

if (startIndex !== -1 && gridIndex !== -1 && (gridIndex - startIndex) < 100) {
    const targetEnd = '</section>';
    const endIndex = content.indexOf(targetEnd, startIndex);
    
    if (endIndex !== -1) {
        const replacement = `{loading ? (
                            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="min-w-[280px] h-[250px] bg-gray-100 dark:bg-neutral-900 animate-pulse rounded-2xl shrink-0 snap-start" />
                                ))}
                            </div>
                        ) : savedProperties.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl p-6 text-center">
                                <Heart className="w-10 h-10 text-gray-200 dark:text-neutral-800 mx-auto mb-3" />
                                <p className="font-black text-gray-400 uppercase tracking-tight text-sm">No saved hostels yet</p>
                                <p className="text-gray-400 text-xs mt-1">Tap ❤️ on any hostel to save it here.</p>
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 hide-scrollbar">
                                {savedProperties.slice(0, 4).map((item) => {
                                    if (!item.properties) return null;
                                    const p = item.properties;
                                    const image = (p.images && p.images.length > 0 && p.images[0] !== 'null') ? p.images[0] : '/placeholder.jpg';
                                    return (
                                        <Link key={item.id} href={\`/property/\${p.id}\`} className="block shrink-0 w-[85vw] sm:w-[300px] snap-start group bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all h-[300px] flex flex-col">
                                            <div className="relative w-full h-[160px] bg-gray-100 shrink-0">
                                                <Image src={image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm z-10">
                                                    <Heart className="w-4 h-4 fill-current" />
                                                </button>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
                                                        <MapPin className="w-3 h-3 text-[#BEF264]" /> {p.location}
                                                    </div>
                                                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight truncate text-sm">{p.title}</h3>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-0.5">Rent</span>
                                                    <span className="font-black text-gray-900 dark:text-white">₦{Number(p.price).toLocaleString()}</span><span className="text-[10px] text-gray-400 font-bold">/yr</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}`;
        
        const newContent = content.substring(0, startIndex) + replacement + '\n                    ' + content.substring(endIndex);
        fs.writeFileSync('app/dashboard/student/page.tsx', newContent, 'utf8');
        console.log('Success');
    }
} else {
    console.log('Target not found');
}
