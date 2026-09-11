const fs = require('fs');
let file = fs.readFileSync('app/property/[id]/page.tsx', 'utf8');

// Remove mobile dummy buttons
file = file.replace(
    '<div className="flex gap-2">\n                    <button className="p-2 rounded-full hover:bg-gray-100"><Share2 className="w-5 h-5 text-gray-700" /></button>\n                    <button className="p-2 rounded-full hover:bg-gray-100"><Heart className="w-5 h-5 text-gray-700" /></button>\n                </div>',
    ''
);

// Remove desktop dummy buttons
file = file.replace(
    '<div className="hidden md:flex absolute top-4 right-4 gap-3">\n                        <button className="bg-white p-2.5 rounded-full shadow-md text-gray-700 hover:text-gray-900 transition-colors hover:scale-105 active:scale-95">\n                            <Share2 className="w-5 h-5" />\n                        </button>\n                        <button className="bg-white p-2.5 rounded-full shadow-md text-gray-700 hover:text-red-500 transition-colors hover:scale-105 active:scale-95">\n                            <Heart className="w-5 h-5" />\n                        </button>\n                    </div>',
    ''
);

fs.writeFileSync('app/property/[id]/page.tsx', file, 'utf8');
