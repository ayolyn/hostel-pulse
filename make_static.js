const fs = require('fs');
const content = `import LandingPageClient from './LandingPageClient';

export default function Home() {
    return <LandingPageClient latestProperties={[]} />;
}
`;
fs.writeFileSync('app/page.tsx', content, 'utf8');

let nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
nextConfig = nextConfig.replace(
`    modularizeImports: {
        "lucide-react": {
            transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
            preventFullImport: true
        }
    },
`, ''
);
fs.writeFileSync('next.config.mjs', nextConfig, 'utf8');

console.log('Restored page.tsx to static');
