import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        template: '%s | HostelPulse',
        default: 'HostelPulse | Premium Student Housing in Ogbomoso',
    },
    description: "The most secure platform to find, inspect, and safely pay for verified student housing and apartments around LAUTECH, Ogbomoso.",
    openGraph: {
        title: 'HostelPulse — Premium Student Housing',
        description: 'Find your perfect student home securely.',
        url: 'https://hostelpulse.com.ng',
        siteName: 'HostelPulse',
        images: [
            {
                url: 'https://hostelpulse.com.ng/og.png',
                width: 1200,
                height: 630,
            },
        ],
        locale: 'en_NG',
        type: 'website',
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/logo-icon.png',
        apple: '/logo-icon.png',
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
            <body className={`${jakarta.variable} font-sans min-h-screen bg-white dark:bg-black transition-colors duration-300`}>
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
