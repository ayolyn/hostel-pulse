import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/admin/', '/api/', '/HOSTELPULSE-hq-admin/'],
        },
        sitemap: 'https://HOSTELPULSE.com.ng/sitemap.xml',
    };
}
