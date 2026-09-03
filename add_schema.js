const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');

const schema = `
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "HostelPulse",
  "image": "https://hostelpulse.com.ng/og.png",
  "description": "Premium Student Housing and Campus Services in Ogbomoso.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ogbomoso",
    "addressRegion": "Oyo State",
    "addressCountry": "NG"
  },
  "url": "https://hostelpulse.com.ng"
};
`;

if (!content.includes('"@type": "LocalBusiness"')) {
    // Insert script tag in the body or head
    const bodyReplacement = `      <body className={\`\${jakarta.variable} font-sans bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 antialiased min-h-screen flex flex-col\`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />`;
    
    content = content.replace(/<body className=\{[^>]+\}>/, bodyReplacement);
    
    // Add the schema constant above the export default function RootLayout
    content = content.replace(/export default function RootLayout/, schema + '\nexport default function RootLayout');
    
    fs.writeFileSync('app/layout.tsx', content);
    console.log('Added structured data to layout.tsx');
}
