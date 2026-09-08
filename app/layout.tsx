import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://hostelpulse.app"),
    title: {
        template: '%s | HostelPulse',
        default: 'HostelPulse | Premium Student Housing in Ogbomoso',
    },
    description: "The most secure platform to find, inspect, and safely pay for verified student housing and apartments around LAUTECH, Ogbomoso.",
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
    
};

import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SavedProvider } from "@/components/providers/SavedProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Footer from "@/components/layout/Footer";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { AuthHashHandler } from "@/components/providers/AuthHashHandler";
import { PortalProvider } from "@/components/auth/PortalGuard";
import { Toaster } from 'react-hot-toast';
import { GlobalAlertsListener } from "@/components/providers/GlobalAlertsListener";

import Script from "next/script";


const jsonLd = {
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
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                                                <link rel="apple-touch-icon" href="/favicon.svg" />
                <Script 
                    src="https://checkout.flutterwave.com/v3.js" 
                    strategy="beforeInteractive"
                />
                <Script id="fw-remove-patch" strategy="beforeInteractive">
                    {`
                        if (typeof Element !== 'undefined') {
                            const originalRemove = Element.prototype.remove;
                            Element.prototype.remove = function() {
                                if (this.parentNode) {
                                    this.parentNode.removeChild(this);
                                }
                            };
                        }
                    `}
                </Script>
            </head>
                  <body className={`${outfit.variable} font-sans bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 antialiased min-h-screen flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
                <Toaster position="top-right" />
                <QueryProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <AuthProvider>
                            <PortalProvider>
                                <SavedProvider>
                                    <AuthHashHandler />
                                    <GlobalAlertsListener />
                                    <main>
                                        {children}
                                    </main>
                                    <ConditionalFooter />
                                </SavedProvider>
                            </PortalProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
