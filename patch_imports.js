const fs = require('fs');
let content = fs.readFileSync('components/dashboard/DetailedProfileForm.tsx', 'utf-8');

if (!content.includes("import toast from 'react-hot-toast';")) {
    content = content.replace(
        "import { useRouter } from 'next/navigation';",
        "import { useRouter } from 'next/navigation';\nimport toast from 'react-hot-toast';"
    );
}

content = content.replace(/if \(onSuccess\) onSuccess\(\);/g, "if (onUpdate) onUpdate();");

fs.writeFileSync('components/dashboard/DetailedProfileForm.tsx', content, 'utf-8');
console.log("Patched imports and onUpdate");
