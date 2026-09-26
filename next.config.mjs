/** @type {import("next").NextConfig} */
const securityHeaders = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-XSS-Protection", value: "1; mode=block" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "origin-when-cross-origin" },
    {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; worker-src 'self' blob:; child-src 'self' blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' blob: data: https: https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.basemaps.cartocdn.com https://basemaps.cartocdn.com https://*.mapbox.com; font-src 'self' data: https:; connect-src 'self' https: wss: blob: https://*.mapbox.com https://events.mapbox.com https://api.mapbox.com https://*.basemaps.cartocdn.com https://basemaps.cartocdn.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org; frame-src 'self' https:;"
    }
];

const nextConfig = {
    async headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
            // Allow OpenAI and other AI agents to read plugin files
            {
                source: "/.well-known/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type" },
                ],
            },
            // Aggressive cache for hashed static assets
            {
                source: "/_next/static/:path*",
                headers: [
                    { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
                ],
            },
            // Cache public files: images, fonts, robots, sitemap, llms.txt
            {
                source: "/(.*)\.(png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2|ttf|otf|xml|txt)",
                headers: [
                    { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
                ],
            },
        ];
    },
    reactStrictMode: false,
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
    compress: true,
    experimental: {
        optimizePackageImports: [
            "lucide-react",
            "framer-motion",
        ],
    },
    images: {
        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        formats: ["image/avif", "image/webp"],
        deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
        imageSizes: [48, 64, 96, 128, 192, 256],
        minimumCacheTTL: 86400,
        remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "hyophkwnbhrmacjdxdba.supabase.co" },
            { protocol: "https", hostname: "api.dicebear.com" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
        ]
    }
};

export default nextConfig;
