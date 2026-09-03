const fs = require('fs');
let content = fs.readFileSync('next.config.mjs', 'utf8');

if (!content.includes('productionBrowserSourceMaps')) {
    content = content.replace('reactStrictMode: false,', 'reactStrictMode: false,\n    productionBrowserSourceMaps: false,');
    fs.writeFileSync('next.config.mjs', content);
    console.log('Disabled production source maps.');
}
