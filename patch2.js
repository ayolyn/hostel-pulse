const fs = require('fs');

const filePath = 'components/dashboard/ListingStudio.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix toast import
if (!content.includes('import toast')) {
    content = content.replace("import { LocationCombobox } from '@/components/ui/LocationCombobox';", "import { LocationCombobox } from '@/components/ui/LocationCombobox';\nimport toast from 'react-hot-toast';");
}

// Fix CheckCircle
content = content.replace("<CheckCircle className=", "<CheckCircle2 className=");

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Fixed imports in ListingStudio.tsx");
