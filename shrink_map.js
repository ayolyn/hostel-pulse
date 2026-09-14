const fs = require('fs');
let content = fs.readFileSync('components/map/PulseMapbox.tsx', 'utf8');

content = content.replace(/min-h-\[550px\]/g, 'min-h-[300px] md:min-h-[500px]');
content = content.replace(/h-\[600px\]/g, 'h-[350px] md:h-[600px]');
content = content.replace(/min-h-\[500px\]/g, 'min-h-[300px] md:min-h-[500px]');
content = content.replace(/minHeight: '500px'/g, "minHeight: '300px'");

fs.writeFileSync('components/map/PulseMapbox.tsx', content, 'utf8');
