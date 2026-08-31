const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ListingStudio.tsx', 'utf-8');

// Find the lucide-react import
const lucideImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
if (lucideImportMatch) {
    if (!lucideImportMatch[1].includes('Camera')) {
        const newImport = lucideImportMatch[1] + ', Camera';
        content = content.replace(lucideImportMatch[1], newImport);
        fs.writeFileSync('components/dashboard/ListingStudio.tsx', content, 'utf-8');
        console.log("Added Camera to lucide-react imports");
    } else {
        console.log("Camera already imported");
    }
}
