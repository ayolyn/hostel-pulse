const fs = require('fs');
let file = fs.readFileSync('app/layout.tsx', 'utf8');

const metadataObj = `export const metadata: Metadata = {
    metadataBase: new URL("https://hostelpulse.app"),
    title: {
        template: '%s | HostelPulse',
        default: 'HostelPulse | Premium Student Housing in Ogbomoso',
    },
    description: "The most secure platform to find, inspect, and safely pay for verified student housing and apartments around LAUTECH, Ogbomoso.",
    icons: {
        icon: '/favicon.svg',
        apple: '/favicon.svg'
    },
    openGraph: {
        title: 'HostelPulse — Premium Student Housing',
        description: 'Find your perfect student home securely.',
        url: 'https://hostelpulse.app',
        siteName: 'HostelPulse',
        images: [
            {
                url: 'https://hostelpulse.app/og.png',
                width: 1200,
                height: 630,
            },
        ],
        locale: 'en_NG',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'HostelPulse',
        description: 'Premium Student Housing & Roommate Matching',
    }
};`;

file = file.replace(/export const metadata: Metadata = \{[\s\S]*?\n\};/, metadataObj);
fs.writeFileSync('app/layout.tsx', file, 'utf8');
