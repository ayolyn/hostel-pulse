import { GlobalSupportWidget } from "@/components/messages/GlobalSupportWidget";
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
        default: 'HostelPulse | Find Verified Hostels Near LAUTECH, Ogbomoso',
    },
    description: "HostelPulse is Nigeria's trusted student housing marketplace. Find verified hostels, shortlets, shops, and land near LAUTECH Ogbomoso. Safe escrow payments, real photos, agent verification.",
    keywords: [
        'hostel near LAUTECH', 'hostel Ogbomoso', 'student housing Ogbomoso',
        'LAUTECH accommodation', 'shortlet Ogbomoso', 'house for rent Ogbomoso',
        'Under-G hostel', 'Adenike hostel', 'cheap hostel LAUTECH',
        'roommate LAUTECH', 'property for sale Ogbomoso', 'HostelPulse',
        'verified hostel Nigeria', 'student marketplace Ogbomoso'
    ],
    alternates: {
        canonical: 'https://hostelpulse.app',
    },
    openGraph: {
        title: 'HostelPulse | Verified Student Housing Near LAUTECH, Ogbomoso',
        description: 'Find verified hostels, shortlets, and properties in Ogbomoso. Safe escrow payments. No agent stress.',
        url: 'https://hostelpulse.app',
        siteName: 'HostelPulse',
        images: [
            {
                url: 'https://hostelpulse.app/og.png',
                width: 1200,
                height: 630,
                alt: 'HostelPulse - Student Housing Near LAUTECH Ogbomoso',
            },
        ],
        locale: 'en_NG',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'HostelPulse | Find Hostels Near LAUTECH Ogbomoso',
        description: 'Verified hostels, shortlets & campus marketplace for LAUTECH students.',
        images: ['https://hostelpulse.app/og.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    other: {
        // AEO - signals for answer engines
        'application-name': 'HostelPulse',
        'generator': 'HostelPulse Technologies',
    },
};

import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SavedProvider } from "@/components/providers/SavedProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { AuthHashHandler } from "@/components/providers/AuthHashHandler";
import { PortalProvider } from "@/components/auth/PortalGuard";
import { Toaster } from 'react-hot-toast';
import { GlobalAlertsListener } from "@/components/providers/GlobalAlertsListener";
import { NewsletterPopup } from "@/components/ui/NewsletterPopup";
import Script from "next/script";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://hostelpulse.app/#website",
      "url": "https://hostelpulse.app/",
      "name": "HostelPulse",
      "description": "Nigeria's most trusted student housing and property marketplace, serving LAUTECH students in Ogbomoso.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://hostelpulse.app/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://hostelpulse.app/#organization",
      "legalName": "HostelPulse Technologies Ltd",
      "name": "HostelPulse",
      "url": "https://hostelpulse.app/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hostelpulse.app/logo-icon.png"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@hostelpulse.app",
        "telephone": "+2348101488169",
        "contactType": "customer support",
        "areaServed": "NG",
        "availableLanguage": "English"
      },
      "areaServed": {
        "@type": "City",
        "name": "Ogbomoso",
        "addressCountry": "NG"
      },
      "sameAs": [
        "https://twitter.com/hostelpulse",
        "https://instagram.com/hostelpulse"
      ]
    },
    {
      "@type": "RealEstateAgent",
      "@id": "https://hostelpulse.app/#realestate",
      "name": "HostelPulse",
      "url": "https://hostelpulse.app/",
      "description": "HostelPulse connects students and renters with verified landlords and agents in Ogbomoso, Nigeria.",
      "areaServed": "Ogbomoso, Oyo State, Nigeria",
      "priceRange": "₦₦"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I find a hostel near LAUTECH?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Visit https://hostelpulse.app/rent to search verified hostels near LAUTECH Ogbomoso. You can filter by location, price, and room type."
          }
        },
        {
          "@type": "Question",
          "name": "Is HostelPulse safe to pay for accommodation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. HostelPulse uses a secure escrow system for all payments. Your money is held safely and only released to the landlord after you confirm receipt of the property."
          }
        },
        {
          "@type": "Question",
          "name": "Can I find a hostel in Under-G Ogbomoso?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. HostelPulse has listings in Under-G, Adenike, Aroje, Takie, and other areas near LAUTECH. Search at https://hostelpulse.app/rent"
          }
        },
        {
          "@type": "Question",
          "name": "Does HostelPulse have shortlet apartments in Ogbomoso?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Browse daily and weekly shortlet apartments at https://hostelpulse.app/shortlet"
          }
        },
        {
          "@type": "Question",
          "name": "How do I list my property on HostelPulse?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sign up as a Landlord or Agent at https://hostelpulse.app/join, complete verification, and use the Listing Studio to add your property with photos and pricing."
          }
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "HostelPulse",
      "operatingSystem": "Web, iOS (PWA), Android (PWA)",
      "applicationCategory": "LifestyleApplication",
      "url": "https://hostelpulse.app/",
      "description": "Student housing and property marketplace for LAUTECH Ogbomoso.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "NGN",
        "description": "Free to search. Small service fee on bookings."
      }
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
                                    <NewsletterPopup />
                                    <main className="flex-1 flex flex-col">
                                        {children}
                                    </main>
                                    <GlobalSupportWidget />
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
