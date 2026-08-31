const fs = require('fs');
const files = [
    'components/dashboard/DetailedProfileForm.tsx',
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    content = content.replace(/p-8 rounded-\[2\.5rem\]/g, 'p-5 rounded-3xl');
    content = content.replace(/p-6 rounded-\[2rem\]/g, 'p-4 rounded-2xl');
    content = content.replace(/p-10 rounded-\[3rem\]/g, 'p-6 rounded-3xl');
    content = content.replace(/p-10 bg-black/g, 'p-6 bg-black');
    content = content.replace(/rounded-\[3rem\]/g, 'rounded-3xl');
    content = content.replace(/gap-8/g, 'gap-4');
    content = content.replace(/gap-6/g, 'gap-4');
    content = content.replace(/mt-12/g, 'mt-6');
    content = content.replace(/mb-8/g, 'mb-6');
    content = content.replace(/text-4xl/g, 'text-2xl sm:text-3xl');

    fs.writeFileSync(file, content, 'utf-8');
    console.log("Patched profile form", file);
});
