const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');
if (!file.includes('import { GlobalSupportWidget }')) {
    file = `import { GlobalSupportWidget } from "@/components/messages/GlobalSupportWidget";\n` + file;
    fs.writeFileSync('app/layout.tsx', file, 'utf8');
}
