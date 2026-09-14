const fs = require('fs');
let content = fs.readFileSync('components/dashboard/SavedPropertiesTab.tsx', 'utf8');

content = content.replace(/price=\{\`[^$]*\$\{Number\(p\.price\)\.toLocaleString\(\)\}\`\}/, 'price={`₦${Number(p.price).toLocaleString()}`}');

fs.writeFileSync('components/dashboard/SavedPropertiesTab.tsx', content, 'utf8');
