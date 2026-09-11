const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

if (!file.includes("icons: {")) {
    file = file.replace(
        "siteName: 'HostelPulse',",
        "siteName: 'HostelPulse',\n    },\n    icons: {\n        icon: '/favicon.svg',\n        apple: '/favicon.svg'\n    },"
    );
}

fs.writeFileSync('app/layout.tsx', file, 'utf8');
