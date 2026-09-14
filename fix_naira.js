const fs = require('fs');

const files = [
    'app/rent/page.tsx',
    'app/buy/page.tsx',
    'app/property/[id]/page.tsx',
    'components/property/PropertyCard.tsx',
    'app/dashboard/student/page.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/\?(\$\{)/g, '₦$1');
        content = content.replace(/>\?([0-9,])/g, '>₦$1');
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Fixed Naira');
