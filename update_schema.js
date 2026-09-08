const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

const oldJsonLdRegex = /const jsonLd = \{[\s\S]*?\};\n/;

const newJsonLd = `const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://hostelpulse.app/#website",
      "url": "https://hostelpulse.app/",
      "name": "HostelPulse",
      "description": "A web platform and marketplace for student housing, roommate matching, and campus commerce."
    },
    {
      "@type": "Organization",
      "@id": "https://hostelpulse.app/#organization",
      "legalName": "HostelPulse Technologies Ltd",
      "name": "HostelPulse",
      "url": "https://hostelpulse.app/",
      "logo": "https://hostelpulse.app/logo-icon.png", 
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@hostelpulse.app",
        "telephone": "+2348101488169",
        "contactType": "customer support"
      },
      "sameAs": [
        "https://twitter.com/hostelpulse",
        "https://instagram.com/hostelpulse"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "HostelPulse",
      "operatingSystem": "Web browser",
      "applicationCategory": "LifestyleApplication",
      "url": "https://hostelpulse.app/",
      "description": "Digital platform helping students find accommodation, match with roommates, and engage in campus commerce."
    }
  ]
};\n`;

file = file.replace(oldJsonLdRegex, newJsonLd);
fs.writeFileSync('app/layout.tsx', file, 'utf8');
