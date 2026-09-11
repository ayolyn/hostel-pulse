const fs = require('fs');
let file = fs.readFileSync('app/property/[id]/page.tsx', 'utf8');

// Remove everything between <div className="flex gap-2"> and </div> for mobile
file = file.replace(
    /<div className="flex gap-2">[\s\S]*?<\/div>/,
    ''
);

// Remove everything between <div className="hidden md:flex absolute top-4 right-4 gap-3"> and </div> for desktop
file = file.replace(
    /<div className="hidden md:flex absolute top-4 right-4 gap-3">[\s\S]*?<\/div>/,
    ''
);

fs.writeFileSync('app/property/[id]/page.tsx', file, 'utf8');
