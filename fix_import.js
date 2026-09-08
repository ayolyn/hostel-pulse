const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');
if (!file.includes('import { GlobalSupportWidget }')) {
    file = file.replace(
        /import \{ Toaster \} from 'react-hot-toast';\n/,
        "import { Toaster } from 'react-hot-toast';\nimport { GlobalSupportWidget } from \"@/components/messages/GlobalSupportWidget\";\n"
    );
    fs.writeFileSync('app/layout.tsx', file, 'utf8');
}
