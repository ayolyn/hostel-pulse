const fs = require('fs');
let file = fs.readFileSync('app/property/[id]/page.tsx', 'utf8');

file = file.replace(
    'property.video_url ? (',
    '(property.video_url && property.video_url.trim().length > 5 && property.video_url !== "null") ? ('
);

fs.writeFileSync('app/property/[id]/page.tsx', file, 'utf8');
