const fs = require('fs');
let content = fs.readFileSync('components/dashboard/ProfileSettingsHub.tsx', 'utf8');

content = content.replace("setTransactions(data || []);\n            setLoadingData(false);", "setTransactions(data || []);\n            }\n            setLoadingData(false);");

fs.writeFileSync('components/dashboard/ProfileSettingsHub.tsx', content, 'utf8');
