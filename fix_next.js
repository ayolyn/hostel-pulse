const fs = require('fs');
let file = fs.readFileSync('next.config.mjs', 'utf8');

const replacement = `const nextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react']
    },
    async headers() {`;

file = file.replace('const nextConfig = {\n    async headers() {', replacement);

fs.writeFileSync('next.config.mjs', file, 'utf8');
console.log('Added optimizePackageImports for lucide-react');
